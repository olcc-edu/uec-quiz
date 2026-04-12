export interface SchoolGroup {
  state: string;
  schools: string[];
}

export const schoolGroups: SchoolGroup[] = [
  {
    state: '柔佛 Johor',
    schools: [
      '宽柔中学（古来分校）',
      '宽柔中学（至达城分校）',
      '宽柔中学',
      '新山华仁中学',
      '笨珍培群独立中学',
      '居銮中华中学',
      '峇株巴辖华仁中学',
      '麻坡中化中学',
      '利丰港培华独立中学',
      '永平中学',
    ],
  },
  {
    state: '雪兰莪 Selangor',
    schools: [
      '巴生光华独立中学',
      '巴生兴华中学',
      '巴生中华独立中学',
      '巴生滨华中学',
      '尊孔独立中学',
      '循人中学',
      '坤成中学',
      '中华独立中学（吉隆坡）',
    ],
  },
  {
    state: '槟城 Penang',
    schools: [
      '韩江中学',
      '槟华女子独立中学',
      '菩提独立中学',
      '钟灵独立中学',
      '恒毅中学',
      '日新独立中学',
    ],
  },
  {
    state: '霹雳 Perak',
    schools: [
      '怡保深斋中学',
      '怡保培南独立中学',
      '霹雳育才独立中学',
      '班台育青中学',
      '金宝培元独立中学',
      '江沙崇华独立中学',
    ],
  },
  {
    state: '森美兰 Negeri Sembilan',
    schools: [
      '芙蓉中华中学',
      '波德申中华中学',
    ],
  },
  {
    state: '马六甲 Melaka',
    schools: [
      '培风中学',
    ],
  },
  {
    state: '吉打 Kedah',
    schools: [
      '吉华独立中学',
      '新民独立中学',
    ],
  },
  {
    state: '彭亨 Pahang',
    schools: [
      '文冬中华中学',
      '关丹中华中学',
      '立卑中华中学',
    ],
  },
  {
    state: '吉兰丹 Kelantan',
    schools: [
      '中华独立中学（哥打巴鲁）',
    ],
  },
  {
    state: '登嘉楼 Terengganu',
    schools: [
      '中华维新中学',
    ],
  },
  {
    state: '砂拉越 Sarawak',
    schools: [
      '古晋中华第一中学',
      '古晋中华第三中学',
      '古晋中华第四中学',
      '石角民立中学',
      '西连民众中学',
      '诗巫公教中学',
      '诗巫黄乃裳中学',
      '诗巫光民中学',
      '诗巫建兴中学',
      '诗巫公民中学',
      '泗里街民立中学',
      '美里培民中学',
      '美里廉律中学',
    ],
  },
  {
    state: '沙巴 Sabah',
    schools: [
      '亚庇建国中学',
      '亚庇育源中学',
      '山打根育源中学',
      '斗湖巴华中学',
      '吧巴中学',
      '保佛中学',
      '古达培正中学',
      '丹南崇正中学',
      '拿笃中学',
    ],
  },
];

// Flatten for dropdown
export const allSchools: string[] = schoolGroups.flatMap(g => g.schools);

// Grade options
export const gradeOptions = [
  { value: '初一', label: '初一 (J1)' },
  { value: '初二', label: '初二 (J2)' },
  { value: '初三', label: '初三 (J3)' },
  { value: '高一', label: '高一 (S1)' },
  { value: '高二', label: '高二 (S2)' },
  { value: '高三', label: '高三 (S3)' },
];
