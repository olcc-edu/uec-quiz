export interface Question {
  id: string;
  level: 'Junior' | 'Senior';
  subject: string;
  chapter: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const initialQuestions: Question[] = [
  // --- Junior Level ---
  {
    id: 'j1',
    level: 'Junior',
    subject: '华文',
    chapter: '语法知识',
    question: '下列句子中，没有语病的一项是：',
    options: [
      '通过这次活动，使我开阔了眼界。',
      '我们要养成爱护公共财物。',
      '他那崇高的品质经常浮现在我的脑海中。',
      '在老师的帮助下，他的学习成绩有了明显的提高。'
    ],
    correctIndex: 3,
    explanation: 'A项缺少主语；B项成分残缺（缺少宾语）；C项主谓搭配不当（品质不能浮现）。'
  },
  {
    id: 'j2',
    level: 'Junior',
    subject: 'Malay',
    chapter: 'Tatabahasa',
    question: 'Pilih ayat yang menggunakan kata ganti nama diri yang betul.',
    options: [
      '“Beta akan berangkat sekarang,” kata rakyat kepada raja.',
      '“Hamba mohon ampun, Tuanku,” kata Bendahara kepada Sultan.',
      '“Saya akan ke istana,” kata Sultan kepada menteri.',
      '“Kami akan pergi,” kata permaisuri kepada dayang.'
    ],
    correctIndex: 1,
    explanation: '“Hamba” digunakan oleh rakyat apabila bercakap dengan raja/sultan.'
  },
  {
    id: 'j3',
    level: 'Junior',
    subject: 'English',
    chapter: 'Grammar',
    question: 'Choose the correct sentence.',
    options: [
      'She don\'t like apples.',
      'He have a big house.',
      'They is playing football.',
      'The cat is sleeping on the mat.'
    ],
    correctIndex: 3,
    explanation: 'Option D is grammatically correct. A should be "doesn\'t", B should be "has", C should be "are".'
  },
  {
    id: 'j4',
    level: 'Junior',
    subject: '数学',
    chapter: '代数',
    question: '若 $2x + 5 = 13$，则 $x$ 的值是：',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: '$2x = 13 - 5 = 8$，所以 $x = 4$。'
  },
  {
    id: 'j5',
    level: 'Junior',
    subject: '科学',
    chapter: '酸碱盐',
    question: '下列哪种物质在水中电离时产生的阴离子全部是氢氧根离子 ($OH^-$)？',
    options: ['氯化钠 ($NaCl$)', '硫酸 ($H_2SO_4$)', '氢氧化钠 ($NaOH$)', '碳酸钠 ($Na_2CO_3$)'],
    correctIndex: 2,
    explanation: '根据碱的定义，在水溶液中电离出的阴离子全部是氢氧根离子的化合物叫做碱。'
  },
  {
    id: 'j6',
    level: 'Junior',
    subject: '历史',
    chapter: '马来西亚历史',
    question: '马六甲王朝的创始人是谁？',
    options: ['敦霹雳', '拜里米苏拉', '汉都亚', '苏丹满速沙'],
    correctIndex: 1,
    explanation: '拜里米苏拉 (Parameswara) 于1400年左右建立了马六甲王朝。'
  },
  {
    id: 'j7',
    level: 'Junior',
    subject: '地理',
    chapter: '地形',
    question: '马来西亚半岛的主干山脉是：',
    options: ['克罗克山脉', '中央山脉', '比兰山脉', '大汉山脉'],
    correctIndex: 1,
    explanation: '中央山脉 (Banjaran Titiwangsa) 是西马的主干山脉。'
  },
  {
    id: 'j8',
    level: 'Junior',
    subject: '美术',
    chapter: '色彩理论',
    question: '下列哪一组是三原色？',
    options: ['红、黄、蓝', '红、绿、蓝', '橙、绿、紫', '黑、白、灰'],
    correctIndex: 0,
    explanation: '美术中的三原色是红、黄、蓝。'
  },

  // --- Senior Level ---
  {
    id: 's1',
    level: 'Senior',
    subject: '华文',
    chapter: '文言文',
    question: '“学而时习之，不亦说乎”中的“说”通：',
    options: ['说', '悦', '阅', '越'],
    correctIndex: 1,
    explanation: '“说”在这里是通假字，通“悦”，意为愉快。'
  },
  {
    id: 's2',
    level: 'Senior',
    subject: 'Malay',
    chapter: 'Pemahaman',
    question: 'Apakah maksud peribahasa "bagai aur dengan tebing"?',
    options: [
      'Saling membantu',
      'Sangat sombong',
      'Sangat malas',
      'Suka bergaduh'
    ],
    correctIndex: 0,
    explanation: '"Bagai aur dengan tebing" bermaksud hidup bermuafakat dan saling membantu.'
  },
  {
    id: 's3',
    level: 'Senior',
    subject: 'English',
    chapter: 'Vocabulary',
    question: 'What is the synonym of "diligent"?',
    options: ['Lazy', 'Hardworking', 'Careless', 'Smart'],
    correctIndex: 1,
    explanation: '"Diligent" means showing care and effort in one\'s work; hardworking.'
  },
  {
    id: 's4',
    level: 'Senior',
    subject: '高中数学',
    chapter: '函数',
    question: '若 $f(x) = x^2 + 1$，则 $f(2)$ 的值是：',
    options: ['3', '4', '5', '6'],
    correctIndex: 2,
    explanation: '$f(2) = 2^2 + 1 = 4 + 1 = 5$。'
  },
  {
    id: 's5',
    level: 'Senior',
    subject: '高级数学',
    chapter: '微积分',
    question: '函数 $y = x^3$ 的导数 $\\frac{dy}{dx}$ 是：',
    options: ['$x^2$', '$3x^2$', '$3x$', '$2x^3$'],
    correctIndex: 1,
    explanation: '根据幂函数的求导法则，$\\frac{d}{dx}(x^n) = nx^{n-1}$。'
  },
  {
    id: 's6',
    level: 'Senior',
    subject: '高级数学I',
    chapter: '三角学',
    question: '$\\sin^2\\theta + \\cos^2\\theta$ 的值恒等于：',
    options: ['0', '1', '$\\tan\\theta$', '$-1$'],
    correctIndex: 1,
    explanation: '这是三角恒等式的基本公式。'
  },
  {
    id: 's7',
    level: 'Senior',
    subject: '高级数学II',
    chapter: '矩阵',
    question: '单位矩阵 $I$ 的行列式值是：',
    options: ['0', '1', '$-1$', 'n'],
    correctIndex: 1,
    explanation: '任何阶数的单位矩阵，其行列式值都等于1。'
  },
  {
    id: 's8',
    level: 'Senior',
    subject: '生物',
    chapter: '细胞',
    question: '细胞中被称为“动力工厂”的细胞器是：',
    options: ['核糖体', '线粒体', '内质网', '高尔基体'],
    correctIndex: 1,
    explanation: '线粒体是进行有氧呼吸、产生能量的主要场所。'
  },
  {
    id: 's9',
    level: 'Senior',
    subject: '化学',
    chapter: '周期表',
    question: '周期表中第18族元素被称为：',
    options: ['碱金属', '卤素', '稀有气体', '过渡金属'],
    correctIndex: 2,
    explanation: '第18族元素（He, Ne, Ar等）化学性质极不活泼，称为稀有气体或惰性气体。'
  },
  {
    id: 's10',
    level: 'Senior',
    subject: '物理',
    chapter: '机械能',
    question: '一个质量为 $m$ 的物体从高度为 $h$ 的地方自由下落，在落地的瞬间，其动能为：',
    options: ['$mgh$', '$\\frac{1}{2}mgh$', '$2mgh$', '0'],
    correctIndex: 0,
    explanation: '根据机械能守恒定律，势能全部转化为动能。'
  },
  {
    id: 's11',
    level: 'Senior',
    subject: '会计',
    chapter: '资产负债表',
    question: '会计等式是：',
    options: [
      '资产 = 负债 + 所有者权益',
      '资产 = 负债 - 所有者权益',
      '负债 = 资产 + 所有者权益',
      '所有者权益 = 资产 + 负债'
    ],
    correctIndex: 0,
    explanation: '这是会计学中最基础的恒等式。'
  },
  {
    id: 's12',
    level: 'Senior',
    subject: '经济',
    chapter: '供需',
    question: '当某种商品的价格上升时，其需求量通常会：',
    options: ['上升', '下降', '保持不变', '不确定'],
    correctIndex: 1,
    explanation: '根据需求定律，价格与需求量呈反方向变动。'
  },
  {
    id: 's13',
    level: 'Senior',
    subject: '商业学',
    chapter: '市场营销',
    question: '市场营销组合中的 4P 不包括：',
    options: ['Product', 'Price', 'Place', 'People'],
    correctIndex: 3,
    explanation: '传统的 4P 是 Product, Price, Place, Promotion。'
  },
  {
    id: 's14',
    level: 'Senior',
    subject: '美术',
    chapter: '艺术史',
    question: '《蒙娜丽莎》是谁的作品？',
    options: ['梵高', '毕加索', '达芬奇', '米开朗基罗'],
    correctIndex: 2,
    explanation: '《蒙娜丽莎》是文艺复兴时期大师达芬奇的代表作。'
  },
  {
    id: 's15',
    level: 'Senior',
    subject: '历史',
    chapter: '世界史',
    question: '第一次世界大战爆发的导火索是：',
    options: [
      '萨拉热窝事件',
      '德国入侵波兰',
      '珍珠港事件',
      '凡尔赛条约的签订'
    ],
    correctIndex: 0,
    explanation: '1914年萨拉热窝事件直接引发了第一次世界大战。'
  },
  {
    id: 's16',
    level: 'Senior',
    subject: '地理',
    chapter: '气候',
    question: '热带雨林气候的特点是：',
    options: [
      '全年高温多雨',
      '夏季高温多雨，冬季寒冷干燥',
      '全年寒冷干燥',
      '夏季炎热干燥，冬季温和多雨'
    ],
    correctIndex: 0,
    explanation: '热带雨林气候分布在赤道附近，全年高温多雨。'
  },
  {
    id: 's17',
    level: 'Senior',
    subject: '电脑',
    chapter: '编程基础',
    question: '在 Python 中，用于输出内容的函数是：',
    options: ['input()', 'print()', 'output()', 'write()'],
    correctIndex: 1,
    explanation: 'print() 是 Python 的标准输出函数。'
  }
];
