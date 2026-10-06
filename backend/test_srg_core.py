import boto3
br = boto3.client("bedrock-runtime", region_name="us-east-1")
r = br.converse(
    modelId="us.amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": [{"text": "hi"}]}],
)
print(r["output"]["message"]["content"][0]["text"])