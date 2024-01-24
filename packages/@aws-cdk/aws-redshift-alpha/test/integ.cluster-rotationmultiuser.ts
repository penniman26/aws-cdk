import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as integ from '@aws-cdk/integ-tests-alpha';
import { Construct } from 'constructs';
import * as redshift from '../lib';

class RedshiftEnv extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', { restrictDefaultSecurityGroup: false });

    const cluster = new redshift.Cluster(this, 'Cluster', {
      vpc: vpc,
      masterUser: {
        masterUsername: 'admin',
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const user = new redshift.User(stack, 'User', {
      cluster,
      databaseName: 'dummyDatabaseName',
      adminUser: cluster.secret,
    });

    cluster.addRotationMultiUser('UserRotation', {
      secret: user.secret,
    });
  }
}

const app = new App();

new integ.IntegTest(app, 'ClusterMultiUserRotationInteg', {
  testCases: [new RedshiftEnv(app, 'redshift-cluster-multiuser-integ')],
});

app.synth();
