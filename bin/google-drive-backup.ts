#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { GoogleDriveBackupStack } from '../lib/google-drive-backup-stack';

const app = new cdk.App();
new GoogleDriveBackupStack(app, 'GoogleDriveBackupStack');
