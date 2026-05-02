# CloudFront Distribution Setup — dehairvault-stream

One-time AWS Console configuration. Do this before testing the HLS player.
Region context: your S3 bucket is in **eu-north-1 (Stockholm)**.

---

## Step 1 — Create an Origin Access Control (OAC)

OAC replaces the legacy OAI and is the current AWS best practice for locking
S3 so it only accepts requests signed by CloudFront.

1. Open **CloudFront → Security → Origin access** in the AWS Console.
2. Click **Create control setting**.
3. Fill in:
   | Field | Value |
   |---|---|
   | Name | `dehairvault-stream-oac` |
   | Description | `OAC for dehairvault-stream HLS bucket` |
   | Origin type | **S3** |
   | Signing behavior | **Sign requests (recommended)** |
   | Signing protocol | **SigV4** |
4. Click **Create**.
5. Copy the **OAC ID** — you'll paste it in Step 2.

---

## Step 2 — Create the CloudFront Distribution

1. Open **CloudFront → Distributions → Create distribution**.

### Origin settings
| Field | Value |
|---|---|
| Origin domain | `dehairvault-stream.s3.eu-north-1.amazonaws.com` |
| Origin path | *(leave blank)* |
| Name | `dehairvault-stream` |
| Origin access | **Origin access control settings (recommended)** |
| Origin access control | Select `dehairvault-stream-oac` (created above) |
| Enable Origin Shield | **Yes** → Region: **Europe (Stockholm)** `eu-north-1` |

> **Why Origin Shield?** It adds a regional caching layer in Stockholm between
> CloudFront edge nodes and your S3 bucket. Reduces S3 GET costs by ~70% and
> improves cache-hit latency for European and African edge locations.

### Default cache behaviour
| Field | Value |
|---|---|
| Path pattern | `Default (*)` |
| Compress objects automatically | **Yes** |
| Viewer protocol policy | **Redirect HTTP to HTTPS** |
| Allowed HTTP methods | **GET, HEAD, OPTIONS** |
| Cache policy | **CachingOptimized** (AWS managed) |
| Origin request policy | **CORS-S3Origin** (AWS managed) |
| Response headers policy | **CORS-with-preflight-and-SecurityHeadersPolicy** (AWS managed) |

> The **CORS-S3Origin** origin request policy forwards the `Origin` header to S3
> so S3 returns CORS headers. The response headers policy adds them to the
> CloudFront response — both are needed for `hls.js` to load segments
> cross-origin.

### Additional HLS cache behaviour (add after distribution is created)

`hls.js` fetches two types of objects with very different caching needs:

| Path pattern | Cache policy | TTL override |
|---|---|---|
| `*/hls/*.m3u8` | **CachingDisabled** | — |
| `*/hls/*.ts` | **CachingOptimized** | Default (86400s) |
| `*/thumbnails/*` | **CachingOptimized** | Default (86400s) |

To add these:
1. Open your distribution → **Behaviours → Create behaviour**.
2. Create one behaviour per row above (most specific path patterns first).
3. All behaviours: same viewer protocol, allowed methods, and response headers
   policy as the default behaviour.

> **.m3u8 playlists must NOT be cached.** Each playlist is regenerated per
> request in theory (though here MediaConvert writes them once). The risk is a
> stale playlist pointing to segment files that no longer exist. Disable caching
> on playlists to be safe. `.ts` segments are immutable once written by
> MediaConvert — cache them aggressively.

### Settings (bottom of the create form)
| Field | Value |
|---|---|
| Price class | **Use all edge locations** |
| IPv6 | **On** |
| Description | `dehairvault-stream HLS CDN` |

4. Click **Create distribution**.
5. Wait ~5 minutes for the distribution to deploy (Status: **Enabled**).
6. Copy the **Distribution domain name** — e.g. `d1abc2defg3hi.cloudfront.net`.

---

## Step 3 — Update the S3 bucket policy

After creating the distribution, CloudFront shows a banner:
**"The S3 bucket policy needs to be updated."**
Click **Copy policy**, then:

1. Open **S3 → dehairvault-stream → Permissions → Bucket policy**.
2. Paste the copied policy and save.

The policy looks like this (CloudFront fills in the actual ARNs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dehairvault-stream/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

**Do not grant public access to the bucket.** All reads go through CloudFront.

---

## Step 4 — S3 CORS configuration

HLS segment requests include an `Origin` header. S3 must be configured to allow it.

1. Open **S3 → dehairvault-stream → Permissions → Cross-origin resource sharing (CORS)**.
2. Paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://dehairvault.com",
      "https://www.dehairvault.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Save.

---

## Step 5 — Add the env var

Add to `.env` and to **Vercel → Project → Environment Variables**:

```
NEXT_PUBLIC_CLOUDFRONT_STREAM_URL=https://d1abc2defg3hi.cloudfront.net
```

Replace `d1abc2defg3hi.cloudfront.net` with your actual distribution domain.
Use the `NEXT_PUBLIC_` prefix — the HLS player component runs client-side and
needs to read this value in the browser.

---

## Step 6 — Smoke test

Once deployed, test that a transcoded video is reachable:

```bash
# Replace with a real outputKeyPrefix from a completed MediaConvert job
curl -I "https://d1abc2defg3hi.cloudfront.net/videos/<your-key>/hls/index.m3u8"
```

Expected: `HTTP/2 200` with `content-type: application/vnd.apple.mpegurl` and
`access-control-allow-origin: *` (or your domain).

---

## Checklist before testing the player

- [ ] Distribution status: **Enabled**
- [ ] S3 bucket policy updated (OAC grant)
- [ ] S3 CORS saved
- [ ] `.m3u8` behaviour created (CachingDisabled)
- [ ] `.ts` behaviour created (CachingOptimized)
- [ ] `NEXT_PUBLIC_CLOUDFRONT_STREAM_URL` set in `.env` and Vercel
- [ ] SQL migration 010 applied in Supabase
