import { ConfigurationSet, ConfigurationSetTlsPolicy, EmailIdentity, Identity, SuppressionReasons } from 'aws-cdk-lib/aws-ses'
import { Construct } from 'constructs'

interface EmailProps {
  verifyUserEmail: string
  sandboxApprovedToEmails?: string[]
}

export default class Email extends Construct {
  readonly configurationSet: ConfigurationSet
  readonly verifyUserEmailIdentity: EmailIdentity
  constructor(scope: Construct, id: string, props: EmailProps) {
    super(scope, id)
    this.configurationSet = new ConfigurationSet(this, 'ConfigurationSet', {
      suppressionReasons: SuppressionReasons.COMPLAINTS_ONLY,
      tlsPolicy: ConfigurationSetTlsPolicy.REQUIRE,
    })
    this.verifyUserEmailIdentity = new EmailIdentity(this, 'VerifyUserEmail', {
      identity: Identity.email(props.verifyUserEmail),
    })

    props.sandboxApprovedToEmails?.map(email => {
      new EmailIdentity(this, `SandboxApprovedEmail_${email.replace(/[^a-zA-Z0-9]/g, '')}`, {
        identity: Identity.email(email),
      })
    })

    /*
    NOTE: By default, all AWS accounts are in SES Sandbox mode.
    For production accounts, follow the instructions at https://codegenie.codes/docs/guides/send-emails-from-custom-domain/.
    For developer accounts, it's instead advised to add email addresses of accounts you'll be using to the
    context.environmentConfig.dev.email.sandboxApprovedToEmails property inside cdk.json
    */
  }
}