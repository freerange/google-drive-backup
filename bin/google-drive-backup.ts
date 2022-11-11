#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GoogleDriveBackupStack } from '../lib/google-drive-backup-stack';

const app = new cdk.App();
new GoogleDriveBackupStack(app, 'GoogleDriveBackupStack');
