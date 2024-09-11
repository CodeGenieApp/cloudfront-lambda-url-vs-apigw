import React from 'react'
import { Button, Form, Input, Checkbox } from 'antd'
import Link from 'next/link'
import UnauthenticatedPage from '../components/layouts/UnauthenticatedPage'
import { useSignUpMutation } from '../components/Me/meHooks'

export default function RegisterPage() {
  const signUpMutation = useSignUpMutation()

  return (
    <UnauthenticatedPage pageTitle="Register">
      <Form layout="vertical" name="register_form" onFinish={signUpMutation.mutate} validateTrigger="onBlur">
        <Form.Item label="Name" name="name" required={false} rules={[{ required: true, message: 'Please enter your name.' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          required={false}
          rules={[
            {
              required: true,
              message: 'Please enter your email.',
              type: 'email',
            },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          style={{ marginBottom: '10px' }}
          label="Password"
          name="password"
          required={false}
          rules={[
            {
              required: true,
              message: 'Please enter your password.',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="agreeToPrivacyAndTerms"
          required={false}
          initialValue={false}
          valuePropName="checked"
          rules={[
            {
              required: true,
              message: 'You must agree before registering.',
              type: 'boolean',
              transform: (value) => value || undefined,
            },
          ]}
        >
          <Checkbox>
            I agree to the{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
            .
          </Checkbox>
        </Form.Item>
        <Form.Item style={{ margin: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button style={{ marginRight: '1rem' }}>
              <Link href="/">Back to login</Link>
            </Button>
            <Button
              type="primary"
              disabled={signUpMutation.isLoading}
              loading={signUpMutation.isLoading}
              htmlType="submit"
              className="login-form-button"
            >
              Register
            </Button>
          </div>
        </Form.Item>
      </Form>
    </UnauthenticatedPage>
  )
}
