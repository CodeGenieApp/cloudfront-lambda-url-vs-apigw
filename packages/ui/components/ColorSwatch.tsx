import { Space } from 'antd'

export default function ColorSwatch({ color }) {
  return (
    <Space style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 20, height: 20, borderRadius: 3, backgroundColor: color }} />
      <span>{color}</span>
    </Space>
  )
}
