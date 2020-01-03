# Google Drive Backup

## Signifcant files

Schedules an ECS Fargate Task to execute a backup script within a Docker container. The backup script runs the `rclone sync` command with a Google Drive directory as the source and an AWS S3 bucket as the target.

```
├── lib
│   └── google-drive-backup-stack.ts    # contains ECS Task definition
└── local-image
    ├── Dockerfile                      # defines docker image for ECS Task
    └── home
        ├── backup.sh                   # script executed by ECS Task
        ├── google-drive-credentials.sh # credentials for Google Drive
        └── rclone.conf                 # includes credentials for AWS S3
```

## Credentials

Note that these credentials are currently baked in to the Docker image filesystem which is not ideal.

### Google Drive access

* Download the JSON credentials file attached to the "Google Drive Backup (Google Service Account user)" entry in the shared 1Password vault and save it as `local-image/home/google-drive-credentials.json`.

* We use these Google Service Account credentials to impersonate a user via [domain-wide delegation of authority](https://developers.google.com/admin-sdk/directory/v1/guides/delegation) as per [these instructions](https://rclone.org/drive/#use-case-google-apps-g-suite-account-and-individual-drive).

### AWS S3 access

* Copy `local-image/home/rclone.example.conf` to `local-image/home/rclone.conf` and replace `<access-key-id>`, `<secret-access-key>` & `<aws-region>` with the appropriate values from the "Google Drive Backup (AWS IAM user credentials)" entry for the `gfr-google-drive-backup` user in the shared 1Password vault.

## Useful commands

Note that `cdk` commands should be run with credentials for an AWS IAM user that has wide ranging permissions to use CloudFormation to create/update/destroy AWS resources. The `gfr-google-drive-backup` user used by `rclone` (see above) is not suitable for this purpose, because it has quite restricted permissions.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
