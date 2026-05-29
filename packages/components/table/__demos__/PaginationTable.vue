<template>
  <div class="demo-table-container">
    <ld-table
      :data="tableData"
      :columns="columns"
      :pagination="pagination"
      border
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    >
      <template #action="scope">
        <el-space>
          <ElButton type="primary" size="small" @click="onEdit(scope)">编辑</ElButton>
          <ElButton type="danger" size="small">删除</ElButton>
        </el-space>
      </template>
    </ld-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, h } from 'vue';
  import { ElTag, ElButton, ElSpace, ElMessage } from 'element-plus';
  const generateMockData = () => {
    const names = ['张', '李', '王', '赵', '钱', '孙', '周', '吴', '郑', '冯', '陈', '廖', '杨'];
    const cities = [
      { name: '北京', districts: ['东城区', '西城区', '朝阳区'] },
      { name: '上海', districts: ['浦东新区', '黄浦区', '静安区'] },
      { name: '广州', districts: ['天河区', '越秀区', '海珠区'] },
      { name: '深圳', districts: ['南山区', '福田区', '罗湖区'] },
      { name: '杭州', districts: ['西湖区', '余杭区', '滨江区'] },
      { name: '成都', districts: ['锦江区', '武侯区', '高新区'] },
      { name: '武汉', districts: ['武昌区', '江汉区', '洪山区'] },
      { name: '厦门', districts: ['思明区', '湖里区', '集美区'] },
      { name: '南京', districts: ['玄武区', '秦淮区', '建邺区'] },
      { name: '天津', districts: ['和平区', '河西区', '南开区'] },
      { name: '重庆', districts: ['渝中区', '江北区', '南岸区'] },
      { name: '沈阳', districts: ['和平区', '沈河区', '皇姑区'] },
      { name: '济南', districts: ['历下区', '市中区', '槐荫区'] },
      { name: '青岛', districts: ['城阳区', '市南区', '崂山区'] },
      { name: '昆明', districts: ['五华区', '盘龙区', '西山区'] },
    ];

    const data = [];

    // 生成100条模拟数据
    for (let i = 0; i < 100; i++) {
      const name = `${names[Math.floor(Math.random() * names.length)]}${i + 1}`;
      const age = 18 + Math.floor(Math.random() * 60);
      const sex = Math.random() > 0.5 ? '男' : '女';
      const cityInfo = cities[Math.floor(Math.random() * cities.length)];
      const district = cityInfo.districts[Math.floor(Math.random() * cityInfo.districts.length)];

      data.push({
        id: i.toString(),
        name,
        age,
        sex,
        address: cityInfo.name,
        city: cityInfo.name,
        district,
        remark: `这是${name}的备注信息，他的年龄是${age}岁，性别是${sex}`,
      });
    }

    return data;
  };

  const tableData = ref<Record<string, unknown>[]>([]);
  tableData.value = generateMockData();

  const columns = [
    { type: 'selection', width: 55, align: 'center', fixed: 'left' },
    { type: 'index', label: '序号', width: 60, align: 'center' },
    {
      prop: 'name',
      label: '姓名',
      width: 100,
      align: 'center',
      showOverflowTooltip: true,
      // renderHeader: () => createTableHeader({ type: 'input', label: '姓名', field: 'name' }),
    },
    { prop: 'age', label: '年龄', width: 60, align: 'center' },
    {
      prop: 'sex',
      label: '性别',
      width: 80,
      align: 'center',
      render: ({ row }: { row: Record<string, unknown> }) => {
        return h(
          ElTag,
          { type: row.sex === '男' ? 'primary' : 'danger', size: 'small' },
          { default: () => row.sex },
        );
      },
      // renderHeader: () =>
      //   createTableHeader({ type: 'checkbox-group', label: '性别', field: 'sex' }),
    },
    {
      prop: 'address',
      label: '地址',
      children: [
        { prop: 'city', label: '城市', width: 100 },
        { prop: 'district', label: '区县', width: 100 },
      ],
    },
    { prop: 'remark', label: '描述', width: 150, showOverflowTooltip: true },
    {
      prop: 'action',
      label: '操作',
      width: 140,
      align: 'center',
      useSlot: true,
      fixed: 'right',
    },
  ];

  // 编辑操作
  function onEdit(scope: { row: Record<string, unknown> }) {
    ElMessage.success(`编辑 ${scope.row.name}`);
  }

  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 50,
  });

  const handleSizeChange = (size: number) => {
    pagination.value.pageSize = size;
  };

  const handleCurrentChange = (page: number) => {
    pagination.value.currentPage = page;
  };
</script>

<style scoped>
  .demo-table-container {
    height: 500px;
  }
</style>
