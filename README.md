# Google Drive Backup

<img src="https://healthchecks.io/badge/311aafdb-71ec-4397-865b-d6437d/zmvTEXvR/google-drive-backup.svg" />

## Significant files

Schedules an ECS Fargate Task to execute a backup script within a Docker container. The backup script runs the `rclone sync` command with a Google Drive directory as the source and an AWS S3 bucket as the target.

```
├── lib
│   └── google-drive-backup-stack.ts      # contains ECS Task definition
└── local-image
    ├── Dockerfile                        # defines docker image for ECS Task
    └── home
        ├── backup.sh                     # script executed by ECS Task
        └── rclone.conf                   # includes config for AWS S3
```

## Configuration

Specify values for the following environment variables in the `.env` file:

* `HEALTHCHECKS_URL` - ping URL for healthchecks.io check
* `GOOGLE_DRIVE_IMPERSONATION_EMAIL` - email address to use with rclone `--drive-impersonate` option
* `GOOGLE_DRIVE_FOLDER` - source folder path
* `RCLONE_S3_REGION` - AWS region in which `cdk deploy` was run and thus S3 bucket was created
* `CRON_SCHEDULE` - JSON representation of JavaScript object conforming to [`CronOptions` interface](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-applicationautoscaling.CronOptions.html), e.g. `{"weekDay":"mon","hour":"03","minute":"15"}`

## Credentials

### Google Drive access

* Download the JSON credentials file attached to the "Google Drive Backup (Google Service Account user)" entry in the shared 1Password vault and save them in a temporary file called `google-drive-credentials.json`.

* Running `cdk deploy` creates a secret named `/google-drive-backup/RCLONE_DRIVE_SERVICE_ACCOUNT_CREDENTIALS` in the AWS Secrets Manager with an automatically generated value. You should overwrite the value of that secret with the JSON credentials string from the previous step using the following command:

```
$ aws secretsmanager put-secret-value --secret-id /google-drive-backup/RCLONE_DRIVE_SERVICE_ACCOUNT_CREDENTIALS --secret-string `cat google-drive-credentials.json`
```

* You can delete the temporary file, `google-drive-credentials.json`, after you've done this, but it might be worth keeping a record of them somewhere secure.

* We use these Google Service Account credentials to impersonate a user via [domain-wide delegation of authority](https://developers.google.com/admin-sdk/directory/v1/guides/delegation) as per [these instructions](https://rclone.org/drive/#use-case-google-apps-g-suite-account-and-individual-drive).

### AWS S3 access

* This is setup automatically when running `cdk deploy` to generate the stack. The `rclone` `env_auth` config setting is set to `true` so that `rclone` uses the IAM role assigned to the ECS Task - see [this section of the documentation](https://rclone.org/s3/#authentication).

## Useful commands

Note that `cdk` commands should be run with credentials for an AWS IAM user that has wide ranging permissions to use CloudFormation to create/update/destroy AWS resources.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
