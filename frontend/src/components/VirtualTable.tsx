import { Table, type TableProps } from 'antd';
import { useMemo } from 'react';

interface VirtualTableProps<T> extends TableProps<T> {
  height?: number;
}

function VirtualTable<T extends object>({ height = 600, ...props }: VirtualTableProps<T>) {
  const scroll = useMemo(() => ({ y: height }), [height]);

  return <Table<T> scroll={scroll} {...props} />;
}

export default VirtualTable;
