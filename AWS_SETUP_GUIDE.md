# AWS S3 Setup Guide for The Network Show

## Step 1: Create AWS Access Keys

1. **Go to AWS Console**: https://console.aws.amazon.com
2. **Sign in** to your AWS account
3. **Click your username** (top right corner) → **Security credentials**
4. **Scroll down** to "Access keys" section
5. **Click "Create access key"**
6. **Select "Application running outside AWS"**
7. **Add description**: "The Network Show S3 Access"
8. **Click "Create access key"**
9. **Download the CSV file** - this contains your:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

## Step 2: Create S3 Bucket

1. **Go to S3 Console**: https://s3.console.aws.amazon.com
2. **Click "Create bucket"**
3. **Bucket name**: `thenetworkshow` (must be globally unique)
4. **Region**: Choose `us-west-2` (Oregon) or `us-east-1` (N. Virginia)
5. **Uncheck "Block all public access"** (you need public access for images)
6. **Acknowledge** the warning about public access
7. **Click "Create bucket"**

## Step 3: Configure Bucket Permissions

1. **Click on your bucket** `thenetworkshow`
2. **Go to "Permissions" tab**
3. **Edit "Bucket policy"** and add:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::thenetworkshow/*"
        }
    ]
}
```

4. **Save changes**

## Step 4: Environment Variables

Add these to your `.env.local` file:

```bash
# AWS Configuration for The Network Show
AWS_REGION="us-west-2"
S3_BUCKET="thenetworkshow"
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_FROM_STEP_1"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY_FROM_STEP_1"
S3_PUBLIC_BASE_URL="https://thenetworkshow.s3.us-west-2.amazonaws.com"
```

## Step 5: Test Your Setup

After updating your `.env.local`:
1. **Restart your development server**: `npm run dev`
2. **Try uploading an image** through your app
3. **Check if it appears** in your S3 bucket

## Troubleshooting

- **Bucket name must be unique** globally across all AWS accounts
- **Region matters** - make sure it matches your `AWS_REGION`
- **Public access** must be enabled for images to be viewable
- **CORS settings** may be needed if you get cross-origin errors
