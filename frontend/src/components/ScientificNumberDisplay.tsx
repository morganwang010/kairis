import React from 'react';

interface ScientificNumberDisplayProps {
  value: number | string | null | undefined;
  precision?: number; // 小数位数，默认2位
  prefix?: string; // 前缀，如货币符号
  suffix?: string; // 后缀
  className?: string; // 自定义类名
}

const ScientificNumberDisplay: React.FC<ScientificNumberDisplayProps> = ({
  value,
  precision = 2,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  // 处理空值或非数字情况
  if (value == null || value === '') {
    return <span className={className}>{prefix}0{suffix}</span>;
  }

  // 转换为数字类型
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // 检查是否为有效数字
  if (isNaN(numValue)) {
    return <span className={className}>{prefix}0{suffix}</span>;
  }

  // 判断是否为整数
  const isInteger = Number.isInteger(numValue);
  
  // 使用千位分隔符格式化数字
  // 如果是整数，不显示小数部分；如果是小数，保留两位小数
  const formattedValue = numValue.toLocaleString('en-US', {
    minimumFractionDigits: isInteger ? 0 : precision,
    maximumFractionDigits: isInteger ? 0 : precision
  });

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default ScientificNumberDisplay;