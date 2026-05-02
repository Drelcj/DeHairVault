'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  MediaConvertClient,
  CreateJobCommand,
  type CreateJobCommandInput,
  type Output,
} from '@aws-sdk/client-mediaconvert'
import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
]

export interface PresignedUrlResult {
  success: true
  uploadUrl: string
  s3Key: string
}

export interface PresignedUrlError {
  success: false
  error: string
}

export async function getVideoUploadPresignedUrl(
  fileName: string,
  contentType: string,
  fileSizeBytes: number
): Promise<PresignedUrlResult | PresignedUrlError> {
  const session = await getSessionUser()
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.profile?.role ?? '')) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
    return { success: false, error: 'Unsupported file type. Allowed: MP4, MOV, AVI, MKV, WebM.' }
  }

  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: 'File exceeds 500 MB limit.' }
  }

  const bucket = process.env.AWS_S3_INGEST_BUCKET
  const region = process.env.AWS_REGION

  if (!bucket || !region) {
    return { success: false, error: 'AWS S3 configuration is missing.' }
  }

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const s3Key = `uploads/${Date.now()}-${sanitizedName}`

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
    ContentLength: fileSizeBytes,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 })

  return { success: true, uploadUrl, s3Key }
}

// ---------------------------------------------------------------------------
// MediaConvert — HLS Adaptive Bitrate transcoding
// ---------------------------------------------------------------------------

export interface TranscodeResult {
  success: true
  jobId: string
  outputKeyPrefix: string
}

export interface TranscodeError {
  success: false
  error: string
}

/**
 * Starts a MediaConvert job that reads from dehairvault-ingest and writes
 * an HLS package (three renditions: 1080p / 720p / 480p) to dehairvault-stream.
 *
 * Output path: s3://dehairvault-stream/<outputKeyPrefix>/
 *   ├── hls/          — .m3u8 master playlist + rendition playlists + .ts segments
 *   └── thumbnails/   — one JPEG thumbnail at 5 s
 */
export async function startVideoTranscoding(
  s3Key: string,
  productId?: string
): Promise<TranscodeResult | TranscodeError> {
  const session = await getSessionUser()
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.profile?.role ?? '')) {
    return { success: false, error: 'Unauthorized' }
  }

  const region = process.env.AWS_REGION
  const endpoint = process.env.AWS_MEDIACONVERT_ENDPOINT
  const roleArn = process.env.AWS_MEDIACONVERT_ROLE_ARN
  const ingestBucket = process.env.AWS_S3_INGEST_BUCKET
  const streamBucket = process.env.AWS_S3_STREAM_BUCKET

  if (!region || !endpoint || !roleArn || !ingestBucket || !streamBucket) {
    return { success: false, error: 'MediaConvert environment variables are not fully configured.' }
  }

  // Derive a stable output prefix from the s3Key, e.g. "uploads/1234-myvideo.mp4" → "1234-myvideo"
  const baseName = s3Key.split('/').pop()?.replace(/\.[^.]+$/, '') ?? `job-${Date.now()}`
  const outputKeyPrefix = `videos/${baseName}`

  const inputUri = `s3://${ingestBucket}/${s3Key}`
  const outputUri = `s3://${streamBucket}/${outputKeyPrefix}/`

  // Three HLS renditions (1080p / 720p / 480p) share a single audio track.
  // Each video output uses H.264 / AAC — the widest-compatible codec pairing for HLS.
  const jobSettings: CreateJobCommandInput['Settings'] = {
    Inputs: [
      {
        FileInput: inputUri,
        AudioSelectors: {
          'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
        },
        VideoSelector: {},
        TimecodeSource: 'ZEROBASED',
      },
    ],
    OutputGroups: [
      // ── HLS Adaptive Bitrate group ──────────────────────────────────────
      {
        Name: 'HLS',
        OutputGroupSettings: {
          Type: 'HLS_GROUP_SETTINGS',
          HlsGroupSettings: {
            SegmentLength: 6,
            MinSegmentLength: 0,
            Destination: `${outputUri}hls/`,
            DirectoryStructure: 'SINGLE_DIRECTORY',
            ManifestCompression: 'NONE',
            StreamInfResolution: 'INCLUDE',
            ClientCache: 'ENABLED',
            CaptionLanguageSetting: 'OMIT',
          },
        },
        Outputs: [
          // 1080p — ~4 Mbps
          buildHlsVideoOutput('1080p', 1920, 1080, 4_000_000, 192_000),
          // 720p — ~2 Mbps
          buildHlsVideoOutput('720p', 1280, 720, 2_000_000, 128_000),
          // 480p — ~800 Kbps  (viable on Nigerian 3G)
          buildHlsVideoOutput('480p', 854, 480, 800_000, 96_000),
        ],
      },
      // ── Thumbnail group ─────────────────────────────────────────────────
      {
        Name: 'Thumbnails',
        OutputGroupSettings: {
          Type: 'FILE_GROUP_SETTINGS',
          FileGroupSettings: {
            Destination: `${outputUri}thumbnails/`,
          },
        },
        Outputs: [
          {
            NameModifier: '-thumb',
            ContainerSettings: { Container: 'RAW' },
            VideoDescription: {
              Width: 1280,
              Height: 720,
              CodecSettings: {
                Codec: 'FRAME_CAPTURE',
                FrameCaptureSettings: {
                  // Capture one frame every 5 seconds; MaxCaptures=1 means just the first hit
                  FramerateNumerator: 1,
                  FramerateDenominator: 5,
                  MaxCaptures: 1,
                  Quality: 80,
                },
              },
            },
          },
        ],
      },
    ],
    TimecodeConfig: { Source: 'ZEROBASED' },
  }

  const client = new MediaConvertClient({
    region,
    endpoint,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const command = new CreateJobCommand({
    Role: roleArn,
    Settings: jobSettings,
    // All keys are included so the EventBridge Lambda can close the loop
    // without querying MediaConvert again.
    UserMetadata: {
      source_key: s3Key,
      output_key_prefix: outputKeyPrefix,
      // Empty string when productId is unknown (create-mode upload before form submit).
      // Lambda falls back to looking up the product by output_key_prefix in that case.
      product_id: productId ?? '',
    },
  })

  const response = await client.send(command)
  const jobId = response.Job?.Id

  if (!jobId) {
    return { success: false, error: 'MediaConvert did not return a job ID.' }
  }

  // In edit mode (productId known): write hls_output_key + transcoding_status
  // directly so Realtime subscriptions in the admin UI fire immediately.
  if (productId) {
    const supabase = createServiceClient()
    await supabase
      .from('products')
      .update({ hls_output_key: outputKeyPrefix, transcoding_status: 'processing' })
      .eq('id', productId)
  }

  return { success: true, jobId, outputKeyPrefix }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHlsVideoOutput(
  nameModifier: string,
  width: number,
  height: number,
  videoBitrate: number,
  audioBitrate: number
): Output {
  return {
    NameModifier: `-${nameModifier}`,
    ContainerSettings: {
      Container: 'M3U8',
      M3u8Settings: {
        AudioFramesPerPes: 4,
        PcrControl: 'PCR_EVERY_PES_PACKET',
        PmtPid: 480,
        PrivateMetadataPid: 503,
        ProgramNumber: 1,
        PatInterval: 0,
        PmtInterval: 0,
        TimedMetadata: 'NONE',
        VideoPid: 481,
        AudioPids: [482, 483, 484, 485, 486, 487, 488, 489, 490],
      },
    },
    VideoDescription: {
      Width: width,
      Height: height,
      ScalingBehavior: 'DEFAULT',
      TimecodeInsertion: 'DISABLED',
      AntiAlias: 'ENABLED',
      Sharpness: 50,
      CodecSettings: {
        Codec: 'H_264',
        H264Settings: {
          InterlaceMode: 'PROGRESSIVE',
          NumberReferenceFrames: 3,
          Syntax: 'DEFAULT',
          Softness: 0,
          GopClosedCadence: 1,
          GopSize: 90,
          Slices: 1,
          GopBReference: 'DISABLED',
          SlowPal: 'DISABLED',
          SpatialAdaptiveQuantization: 'ENABLED',
          TemporalAdaptiveQuantization: 'ENABLED',
          FlickerAdaptiveQuantization: 'DISABLED',
          EntropyEncoding: 'CABAC',
          Bitrate: videoBitrate,
          FramerateControl: 'INITIALIZE_FROM_SOURCE',
          RateControlMode: 'CBR',
          CodecProfile: 'MAIN',
          Telecine: 'NONE',
          MinIInterval: 0,
          AdaptiveQuantization: 'HIGH',
          CodecLevel: 'AUTO',
          FieldEncoding: 'PAFF',
          SceneChangeDetect: 'ENABLED',
          QualityTuningLevel: 'SINGLE_PASS',
          FramerateConversionAlgorithm: 'DUPLICATE_DROP',
          UnregisteredSeiTimecode: 'DISABLED',
          GopSizeUnits: 'FRAMES',
          ParControl: 'INITIALIZE_FROM_SOURCE',
          NumberBFramesBetweenReferenceFrames: 2,
          RepeatPps: 'DISABLED',
        },
      },
      AfdSignaling: 'NONE',
      DropFrameTimecode: 'ENABLED',
      RespondToAfd: 'NONE',
      ColorMetadata: 'INSERT',
    },
    AudioDescriptions: [
      {
        AudioTypeControl: 'FOLLOW_INPUT',
        AudioSourceName: 'Audio Selector 1',
        CodecSettings: {
          Codec: 'AAC',
          AacSettings: {
            AudioDescriptionBroadcasterMix: 'NORMAL',
            Bitrate: audioBitrate,
            RateControlMode: 'CBR',
            CodecProfile: 'LC',
            CodingMode: 'CODING_MODE_2_0',
            RawFormat: 'NONE',
            SampleRate: 48000,
            Specification: 'MPEG4',
          },
        },
        LanguageCodeControl: 'FOLLOW_INPUT',
      },
    ],
  }
}
