/* =========================================================================
 *  BUAA OJ · 数据层
 *  ---------------------------------------------------------------------
 *  1. UNITS      : 6 个教学单元，对应《C 语言程序设计》课程进度
 *  2. CONTESTS   : 每单元 2 场比赛 —— E* 作业赛（基础巩固）、C* 上机赛（限时实战）
 *  3. PROBLEMS   : 48 道互不相同的题目，每场比赛一组，渐进难度
 *  4. RANKS      : 排行榜演示数据
 *  所有数据均为前端演示数据，不连接真实评测机。
 * ========================================================================= */

/* ------------------------------ 教学单元 ------------------------------ */
const UNITS = [
  {
    n: 1, key: 'U1',
    title: '顺序结构与输入输出',
    topics: 'scanf / printf · 变量与数据类型 · 算术运算 · 格式化输出',
    goal: '能独立完成格式化输入、简单计算与按位小数输出。'
  },
  {
    n: 2, key: 'U2',
    title: '分支结构与条件判断',
    topics: 'if / else · 关系与逻辑运算 · switch · 多分支',
    goal: '能把自然语言中的分类规则翻译成互斥且完备的条件分支。'
  },
  {
    n: 3, key: 'U3',
    title: '循环结构与迭代',
    topics: 'for / while · 累加累乘 · 枚举 · 素数判定',
    goal: '会用循环描述重复过程，并能控制循环的边界与终止条件。'
  },
  {
    n: 4, key: 'U4',
    title: '数组、字符串与矩阵',
    topics: '一维数组 · 字符数组 · 二维数组 · 排序与查找',
    goal: '能用数组批量组织数据，完成统计、排序、查找与矩阵操作。'
  },
  {
    n: 5, key: 'U5',
    title: '函数与递归',
    topics: '函数定义与调用 · 参数传递 · 递归 · 分治思想',
    goal: '能把问题拆成可复用的函数，并用递归描述自相似结构。'
  },
  {
    n: 6, key: 'U6',
    title: '指针、结构体与文件',
    topics: '指针与地址 · 结构体 · 指针与数组 · 文件读写',
    goal: '理解内存地址与数据组织方式，能用结构体描述实体数据。'
  }
];

/* ------------------------------- 比赛 -------------------------------- */
/* kind: homework = E 作业赛（时间充裕，先做）  lab = C 上机赛（限时，后做） */
const CONTESTS = [
  {
    id: 'E1', kind: 'homework', unit: 1, title: '第一次作业赛',
    start: '2026-09-08 08:00', end: '2026-09-14 23:59',
    desc: '本周作业覆盖输入输出、变量、算术运算与格式化输出。题目均为教材课后基础题，建议在纸上先写出公式再上机。'
  },
  {
    id: 'C1', kind: 'lab', unit: 1, title: '第一次上机赛',
    start: '2026-09-15 14:00', end: '2026-09-15 16:00',
    desc: '第一次上机，环境已配置完毕。限时 2 小时，重点考察格式化输入输出与浮点数精度控制，注意换行与空格。'
  },
  {
    id: 'E2', kind: 'homework', unit: 2, title: '第二次作业赛',
    start: '2026-09-22 08:00', end: '2026-09-28 23:59',
    desc: '分支结构专项：奇偶判断、三数比较、成绩等级与闰年判定。请先画清条件表，再动手写 if 链。'
  },
  {
    id: 'C2', kind: 'lab', unit: 2, title: '第二次上机赛',
    start: '2026-09-29 14:00', end: '2026-09-29 16:00',
    desc: '限时上机：三角形判定、一元二次方程、分段计费与字符分类。边界条件（浮点误差、非法输入）是本次的失分点。'
  },
  {
    id: 'E3', kind: 'homework', unit: 3, title: '第三次作业赛',
    start: '2026-10-13 08:00', end: '2026-10-19 23:59',
    desc: '循环结构专项：累加、阶乘、乘法表与素数。注意循环变量初值、步长与结束条件三件事。'
  },
  {
    id: 'C3', kind: 'lab', unit: 3, title: '第三次上机赛',
    start: '2026-10-27 14:00', end: '2026-10-31 16:00',
    desc: '期中前的最后一次上机，综合考察求最大公约数、水仙花数、斐波那契与数位统计。题目不难，但要一次写对。'
  },
  {
    id: 'E4', kind: 'homework', unit: 4, title: '第四次作业赛',
    start: '2026-11-03 08:00', end: '2026-11-09 23:59',
    desc: '数组与字符串：求和平均、最大值定位、冒泡排序、字符计数。请务必练习数组下标从 0 开始的习惯。'
  },
  {
    id: 'C4', kind: 'lab', unit: 4, title: '第四次上机赛',
    start: '2026-11-10 14:00', end: '2026-11-10 16:00',
    desc: '限时上机：数组逆序、线性查找、矩阵转置与大小写转换。二维数组的行列对应关系是重点。'
  },
  {
    id: 'E5', kind: 'homework', unit: 5, title: '第五次作业赛',
    start: '2026-11-17 08:00', end: '2026-11-23 23:59',
    desc: '函数与递归：阶乘、斐波那契、汉诺塔与回文判定。写递归前先明确「终止条件」与「规模缩小」。'
  },
  {
    id: 'C5', kind: 'lab', unit: 5, title: '第五次上机赛',
    start: '2026-11-24 14:00', end: '2026-11-24 16:00',
    desc: '限时上机：递归求最大公约数、快速幂、递归求最大值、十进制转二进制。注意递归深度与溢出。'
  },
  {
    id: 'E6', kind: 'homework', unit: 6, title: '第六次作业赛',
    start: '2026-12-01 08:00', end: '2026-12-07 23:59',
    desc: '指针、结构体与文件：指针交换、结构体统计、单词计数、指针反转字符串。理解「地址」是本单元的全部。'
  },
  {
    id: 'C6', kind: 'lab', unit: 6, title: '第六次上机赛',
    start: '2026-12-08 14:00', end: '2026-12-08 16:00',
    desc: '期末前的综合上机：结构体排序、分数段统计、指针拼接字符串、单词首字母大写。'
  }
];

/* ------------------------------- 题目 -------------------------------- */
/* id 命名规则：<比赛号>-<题序>，例如 E1-3 = 第一次作业赛第 3 题 */
const PROBLEMS = {
  /* ============ 第一章 · E1 作业赛 ============ */
  'E1-1': {
    id: 'E1-1', no: 1, contest: 'E1', unit: 1, title: '圆周长与面积',
    difficulty: '入门', tags: ['顺序结构', '浮点数', '格式输出'], rate: 94,
    desc: '给定圆的半径 r，计算并输出该圆的周长与面积。圆周率取 3.14159。',
    input: '一行一个实数 r（0 < r ≤ 1000）。',
    output: '一行两个实数，依次为周长与面积，均保留 2 位小数，用一个空格分隔。',
    sampleIn: '1.5',
    sampleOut: '9.42 7.07',
    hint: '周长 = 2πr，面积 = πr²。输出用 printf("%.2f %.2f\\n", c, s)。'
  },
  'E1-2': {
    id: 'E1-2', no: 2, contest: 'E1', unit: 1, title: '摄氏度转华氏度',
    difficulty: '入门', tags: ['顺序结构', '表达式', '保留小数'], rate: 96,
    desc: '输入一个整数摄氏温度 c，按公式 F = c × 9 / 5 + 32 换算成华氏温度并输出。',
    input: '一行一个整数 c（-100 ≤ c ≤ 1000）。',
    output: '一行一个实数，表示华氏温度，保留 1 位小数。',
    sampleIn: '100',
    sampleOut: '212.0',
    hint: '整数相除会截断：写成 c * 9.0 / 5 + 32，或者先乘后除。'
  },
  'E1-3': {
    id: 'E1-3', no: 3, contest: 'E1', unit: 1, title: '三位数反转',
    difficulty: '简单', tags: ['顺序结构', '整除取余'], rate: 89,
    desc: '输入一个三位正整数，把它各位数字的顺序反转后输出。反转后的数不保留前导零。',
    input: '一行一个三位正整数 n（100 ≤ n ≤ 999）。',
    output: '一行一个整数，表示反转后的结果。',
    sampleIn: '120',
    sampleOut: '21',
    hint: '个位 n%10、十位 n/10%10、百位 n/100，再按位权重新组合即可。'
  },
  'E1-4': {
    id: 'E1-4', no: 4, contest: 'E1', unit: 1, title: '秒数换算',
    difficulty: '简单', tags: ['顺序结构', '整除取余'], rate: 87,
    desc: '给定一个非负整数表示的总秒数，换算成「时 分 秒」的形式输出。',
    input: '一行一个非负整数 s（0 ≤ s ≤ 86400）。',
    output: '一行三个整数，依次为时、分、秒，用空格分隔。',
    sampleIn: '3725',
    sampleOut: '1 2 5',
    hint: '时 = s/3600，分 = s%3600/60，秒 = s%60。'
  },

  /* ============ 第一章 · C1 上机赛 ============ */
  'C1-1': {
    id: 'C1-1', no: 1, contest: 'C1', unit: 1, title: '两数之和与积',
    difficulty: '入门', tags: ['输入输出', '算术运算'], rate: 97,
    desc: '输入两个整数 a、b，输出它们的和与积。',
    input: '一行两个整数 a、b（-10000 ≤ a, b ≤ 10000）。',
    output: '一行两个整数，依次为 a+b 与 a×b，用空格分隔。',
    sampleIn: '3 4',
    sampleOut: '7 12',
    hint: 'scanf("%d%d", &a, &b) 一次读入两个整数。'
  },
  'C1-2': {
    id: 'C1-2', no: 2, contest: 'C1', unit: 1, title: '三科平均分',
    difficulty: '简单', tags: ['输入输出', '类型转换'], rate: 91,
    desc: '输入语文、数学、英语三门课的成绩（整数），输出三门课的平均分。',
    input: '一行三个整数，表示三科成绩（0 ≤ 成绩 ≤ 100）。',
    output: '一行一个实数，表示平均分，保留 2 位小数。',
    sampleIn: '80 90 100',
    sampleOut: '90.00',
    hint: '求平均前先转成 double，避免整数除法丢掉小数。'
  },
  'C1-3': {
    id: 'C1-3', no: 3, contest: 'C1', unit: 1, title: '交换两个数',
    difficulty: '入门', tags: ['变量', '临时变量'], rate: 95,
    desc: '输入两个整数，交换它们的值后按「先输入的后输出」的顺序打印。',
    input: '一行两个整数 a、b。',
    output: '一行两个整数，依次为交换后的 a、b。',
    sampleIn: '1 2',
    sampleOut: '2 1',
    hint: '借助临时变量 t：t=a; a=b; b=t;'
  },
  'C1-4': {
    id: 'C1-4', no: 4, contest: 'C1', unit: 1, title: '球的体积',
    difficulty: '简单', tags: ['浮点数', '格式输出'], rate: 84,
    desc: '输入球的半径 r，计算球的体积。圆周率取 3.14159，体积公式 V = 4/3 × π × r³。',
    input: '一行一个实数 r（0 < r ≤ 100）。',
    output: '一行一个实数，表示体积，保留 3 位小数。',
    sampleIn: '1',
    sampleOut: '4.189',
    hint: '写成 4.0 / 3 * 3.14159 * r * r * r，注意 4/3 在整数下等于 1。'
  },

  /* ============ 第二章 · E2 作业赛 ============ */
  'E2-1': {
    id: 'E2-1', no: 1, contest: 'E2', unit: 2, title: '奇偶判断',
    difficulty: '入门', tags: ['if 分支', '取余'], rate: 96,
    desc: '输入一个整数 n，判断它是奇数还是偶数。',
    input: '一行一个整数 n（-10⁹ ≤ n ≤ 10⁹）。',
    output: '奇数输出「奇数」，偶数输出「偶数」（不含引号）。',
    sampleIn: '7',
    sampleOut: '奇数',
    hint: 'n % 2 的余数与正负号有关，判断 n % 2 != 0 更稳妥。'
  },
  'E2-2': {
    id: 'E2-2', no: 2, contest: 'E2', unit: 2, title: '三数最大值',
    difficulty: '简单', tags: ['条件判断', '比较'], rate: 93,
    desc: '输入三个整数，输出其中最大的一个。',
    input: '一行三个整数 a、b、c（绝对值不超过 10⁹）。',
    output: '一行一个整数，表示最大值。',
    sampleIn: '3 9 5',
    sampleOut: '9',
    hint: '先假设 a 最大，再依次与 b、c 比较更新即可。'
  },
  'E2-3': {
    id: 'E2-3', no: 3, contest: 'E2', unit: 2, title: '成绩等级',
    difficulty: '简单', tags: ['多分支', '区间判断'], rate: 88,
    desc: '按分数给出等级：90~100 为 A，80~89 为 B，70~79 为 C，60~69 为 D，0~59 为 E。',
    input: '一行一个整数 score（0 ≤ score ≤ 100）。',
    output: '一行一个大写字母，表示等级。',
    sampleIn: '85',
    sampleOut: 'B',
    hint: '用 else if 从高分往低分判断，天然互斥。'
  },
  'E2-4': {
    id: 'E2-4', no: 4, contest: 'E2', unit: 2, title: '闰年判断',
    difficulty: '简单', tags: ['逻辑运算', '闰年'], rate: 90,
    desc: '判断给定年份是否为闰年。能被 4 整除且不能被 100 整除，或能被 400 整除的年份是闰年。',
    input: '一行一个整数 year（1 ≤ year ≤ 9999）。',
    output: '是闰年输出 YES，否则输出 NO。',
    sampleIn: '2000',
    sampleOut: 'YES',
    hint: '(year % 4 == 0 && year % 100 != 0) || year % 400 == 0'
  },

  /* ============ 第二章 · C2 上机赛 ============ */
  'C2-1': {
    id: 'C2-1', no: 1, contest: 'C2', unit: 2, title: '三角形判定',
    difficulty: '中等', tags: ['条件组合', '边界'], rate: 76,
    desc: '输入三条边的长度，判断它们能构成什么类型的三角形。',
    input: '一行三个整数 a、b、c（1 ≤ a, b, c ≤ 1000）。',
    output: '输出「等边三角形」「等腰三角形」「普通三角形」之一；若不能构成三角形，输出「不能构成三角形」。',
    sampleIn: '3 3 3',
    sampleOut: '等边三角形',
    hint: '先判断任意两边之和大于第三边，再判断边相等的情况。'
  },
  'C2-2': {
    id: 'C2-2', no: 2, contest: 'C2', unit: 2, title: '一元二次方程',
    difficulty: '中等', tags: ['数学', '浮点数', 'sqrt'], rate: 71,
    desc: '解一元二次方程 ax² + bx + c = 0，输出它的两个实根。',
    input: '一行三个整数 a、b、c（a ≠ 0，|a|, |b|, |c| ≤ 1000）。',
    output: '若有两个实根，按从小到大输出，均保留 2 位小数，用空格分隔；若无实根，输出 NO。',
    sampleIn: '1 -3 2',
    sampleOut: '1.00 2.00',
    hint: '判别式 d = b² - 4ac；d < 0 时无实根，注意用 1e-9 处理浮点比较。'
  },
  'C2-3': {
    id: 'C2-3', no: 3, contest: 'C2', unit: 2, title: '出租车计费',
    difficulty: '中等', tags: ['分段计费', '浮点数'], rate: 68,
    desc: '出租车起步价 13 元，含 3 公里；超过 3 公里的部分每公里 2.3 元；等候费每分钟 0.5 元。里程不足 1 公里的部分按 1 公里计算。',
    input: '一行两个整数：行驶里程 km（0 ≤ km ≤ 500）与等候时间 min（0 ≤ min ≤ 600）。里程单位是公里，不足 1 公里向上取整。',
    output: '一行一个实数，表示总费用，保留 1 位小数。',
    sampleIn: '10 0',
    sampleOut: '29.1',
    hint: '13 + (10-3)*2.3 = 29.1；等候费另加 min*0.5。'
  },
  'C2-4': {
    id: 'C2-4', no: 4, contest: 'C2', unit: 2, title: '字符分类',
    difficulty: '简单', tags: ['字符', 'ASCII'], rate: 82,
    desc: '输入一个字符，判断它属于大写字母、小写字母、数字还是其他字符。',
    input: '一行一个可见字符。',
    output: '输出「大写字母」「小写字母」「数字」「其他字符」之一。',
    sampleIn: 'A',
    sampleOut: '大写字母',
    hint: '注意用 %c 读入，前导空格会被当作字符，必要时在格式串前加一个空格。'
  },

  /* ============ 第三章 · E3 作业赛 ============ */
  'E3-1': {
    id: 'E3-1', no: 1, contest: 'E3', unit: 3, title: '1 到 n 求和',
    difficulty: '入门', tags: ['for 循环', '累加'], rate: 95,
    desc: '输入正整数 n，输出 1 + 2 + … + n 的结果。',
    input: '一行一个正整数 n（1 ≤ n ≤ 10⁶）。',
    output: '一行一个整数，表示和。',
    sampleIn: '100',
    sampleOut: '5050',
    hint: '用 long long 保存结果，防止 n 较大时溢出。'
  },
  'E3-2': {
    id: 'E3-2', no: 2, contest: 'E3', unit: 3, title: '阶乘',
    difficulty: '简单', tags: ['for 循环', '累乘'], rate: 90,
    desc: '输入正整数 n，输出 n 的阶乘 n!。',
    input: '一行一个整数 n（1 ≤ n ≤ 12）。',
    output: '一行一个整数，表示 n!。',
    sampleIn: '5',
    sampleOut: '120',
    hint: 'n ≤ 12 时 int 足够；若 n 更大就要用 long long 甚至高精度。'
  },
  'E3-3': {
    id: 'E3-3', no: 3, contest: 'E3', unit: 3, title: '九九乘法表',
    difficulty: '简单', tags: ['双重循环', '格式'], rate: 85,
    desc: '输出九九乘法表的前 n 行。第 i 行有 i 个等式，形如 i*j=k，等式之间用一个空格分隔，行末不要多余空格。',
    input: '一行一个整数 n（1 ≤ n ≤ 9）。',
    output: '共 n 行，具体格式见样例。',
    sampleIn: '3',
    sampleOut: '1*1=1\n1*2=2 2*2=4\n1*3=3 2*3=6 3*3=9',
    hint: '外层 i 从 1 到 n，内层 j 从 1 到 i；行末换行，行内空格只在 j<i 时输出。'
  },
  'E3-4': {
    id: 'E3-4', no: 4, contest: 'E3', unit: 3, title: '素数判断',
    difficulty: '中等', tags: ['循环', '素数', 'break 跳出'], rate: 79,
    desc: '判断一个正整数是否为素数。素数是指大于 1 且只能被 1 和自身整除的整数。',
    input: '一行一个整数 n（1 ≤ n ≤ 10⁹）。',
    output: '是素数输出 YES，否则输出 NO。',
    sampleIn: '97',
    sampleOut: 'YES',
    hint: '只需枚举到 sqrt(n)；n < 2 时直接输出 NO。'
  },

  /* ============ 第三章 · C3 上机赛 ============ */
  'C3-1': {
    id: 'C3-1', no: 1, contest: 'C3', unit: 3, title: '最大公约数与最小公倍数',
    difficulty: '简单', tags: ['辗转相除', '循环'], rate: 88,
    desc: '输入两个正整数，输出它们的最大公约数与最小公倍数。',
    input: '一行两个正整数 a、b（1 ≤ a, b ≤ 10⁶）。',
    output: '一行两个整数，依次为最大公约数与最小公倍数，用空格分隔。',
    sampleIn: '12 18',
    sampleOut: '6 36',
    hint: '辗转相除求 gcd，lcm = a / gcd * b（先除后乘防止溢出）。'
  },
  'C3-2': {
    id: 'C3-2', no: 2, contest: 'C3', unit: 3, title: '水仙花数',
    difficulty: '简单', tags: ['枚举', '数位分解'], rate: 83,
    desc: '水仙花数是指一个三位数，其各位数字的立方和等于它本身。请输出 100 到 999 之间所有的水仙花数。',
    input: '本题无输入。',
    output: '一行，按从小到大的顺序输出所有水仙花数，用空格分隔。',
    sampleIn: '（无输入）',
    sampleOut: '153 370 371 407',
    hint: '枚举 100~999，拆出百位、十位、个位后判断 a³+b³+c³ == n。'
  },
  'C3-3': {
    id: 'C3-3', no: 3, contest: 'C3', unit: 3, title: '斐波那契数列',
    difficulty: '简单', tags: ['递推', '循环'], rate: 86,
    desc: '斐波那契数列定义为 F(1)=1，F(2)=1，F(n)=F(n-1)+F(n-2)。输出它的前 n 项。',
    input: '一行一个整数 n（1 ≤ n ≤ 50）。',
    output: '一行 n 个整数，为数列的前 n 项，用空格分隔。',
    sampleIn: '7',
    sampleOut: '1 1 2 3 5 8 13',
    hint: '用 long long 保存，n = 50 时结果已接近 2×10¹⁰。'
  },
  'C3-4': {
    id: 'C3-4', no: 4, contest: 'C3', unit: 3, title: '数位统计',
    difficulty: '简单', tags: ['循环', '取余'], rate: 81,
    desc: '输入一个正整数 n，统计它的位数以及各位数字之和。',
    input: '一行一个正整数 n（1 ≤ n ≤ 10¹⁸）。',
    output: '一行两个整数，依次为位数与各位数字之和，用空格分隔。',
    sampleIn: '2026',
    sampleOut: '4 10',
    hint: '用 long long 读入（%lld），每次 n % 10 取末位再 n / 10。'
  },

  /* ============ 第四章 · E4 作业赛 ============ */
  'E4-1': {
    id: 'E4-1', no: 1, contest: 'E4', unit: 4, title: '数组求和与平均',
    difficulty: '入门', tags: ['一维数组', '累加'], rate: 93,
    desc: '输入 n 个整数，输出它们的和与平均值。',
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）；第二行 n 个整数（绝对值不超过 10⁴）。',
    output: '一行两个数：整数部分为和，平均值为实数，保留 2 位小数，用空格分隔。',
    sampleIn: '5\n1 2 3 4 5',
    sampleOut: '15 3.00',
    hint: '和用 long long 保存，平均值用 (double)sum / n。'
  },
  'E4-2': {
    id: 'E4-2', no: 2, contest: 'E4', unit: 4, title: '最大值与位置',
    difficulty: '简单', tags: ['一维数组', '遍历'], rate: 90,
    desc: '输入 n 个整数，找出最大值以及它第一次出现的位置（位置从 1 开始编号）。',
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）；第二行 n 个整数。',
    output: '一行两个整数，依次为最大值与其第一次出现的位置，用空格分隔。',
    sampleIn: '6\n3 7 2 7 1 9',
    sampleOut: '9 6',
    hint: '记录最大值的同时记录下标；值相等时不更新，保证取第一次出现的位置。'
  },
  'E4-3': {
    id: 'E4-3', no: 3, contest: 'E4', unit: 4, title: '冒泡排序',
    difficulty: '中等', tags: ['排序', '双重循环'], rate: 78,
    desc: '输入 n 个整数，使用冒泡排序将它们按从小到大的顺序输出。',
    input: '第一行一个整数 n（1 ≤ n ≤ 500）；第二行 n 个整数（绝对值不超过 10⁵）。',
    output: '一行 n 个整数，为升序排列后的结果，用空格分隔。',
    sampleIn: '5\n5 3 8 1 9',
    sampleOut: '1 3 5 8 9',
    hint: '两两比较相邻元素，逆序则交换；n-1 轮之后序列有序。'
  },
  'E4-4': {
    id: 'E4-4', no: 4, contest: 'E4', unit: 4, title: '字符计数',
    difficulty: '中等', tags: ['字符串', '字符判断'], rate: 74,
    desc: '输入一个不含空格的字符串，统计其中字母、数字和其他字符的个数。',
    input: '一行一个字符串，长度不超过 100，不含空格。',
    output: '一行三个整数，依次为字母、数字、其他字符的个数。',
    sampleIn: 'Hello123!',
    sampleOut: '5 3 1',
    hint: '用 isalpha、isdigit（需 #include <ctype.h>）或直接比较 ASCII 区间。'
  },

  /* ============ 第四章 · C4 上机赛 ============ */
  'C4-1': {
    id: 'C4-1', no: 1, contest: 'C4', unit: 4, title: '数组逆序',
    difficulty: '入门', tags: ['数组', '交换'], rate: 92,
    desc: '输入 n 个整数，将它们逆序输出。',
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）；第二行 n 个整数。',
    output: '一行 n 个整数，为逆序后的序列，用空格分隔。',
    sampleIn: '5\n1 2 3 4 5',
    sampleOut: '5 4 3 2 1',
    hint: '可以原地首尾交换，也可以从 n-1 到 0 倒着输出。'
  },
  'C4-2': {
    id: 'C4-2', no: 2, contest: 'C4', unit: 4, title: '线性查找',
    difficulty: '简单', tags: ['数组', '查找'], rate: 87,
    desc: '在 n 个整数中查找目标值 x，输出它第一次出现的位置（从 1 开始编号）。',
    input: '第一行两个整数 n、x（1 ≤ n ≤ 1000）；第二行 n 个整数。',
    output: '找到则输出第一次出现的位置，否则输出 -1。',
    sampleIn: '6 4\n1 2 3 4 5 6',
    sampleOut: '4',
    hint: '顺序遍历，找到即 break，可以避免输出多次。'
  },
  'C4-3': {
    id: 'C4-3', no: 3, contest: 'C4', unit: 4, title: '矩阵转置',
    difficulty: '中等', tags: ['二维数组', '转置'], rate: 72,
    desc: '输入一个 m 行 n 列的整数矩阵，输出它的转置（n 行 m 列）。',
    input: '第一行两个整数 m、n（1 ≤ m, n ≤ 50）；接下来 m 行，每行 n 个整数。',
    output: '共 n 行，每行 m 个整数，为转置后的矩阵。',
    sampleIn: '2 3\n1 2 3\n4 5 6',
    sampleOut: '1 4\n2 5\n3 6',
    hint: '转置后第 i 行第 j 列 = 原矩阵第 j 行第 i 列。'
  },
  'C4-4': {
    id: 'C4-4', no: 4, contest: 'C4', unit: 4, title: '小写转大写',
    difficulty: '简单', tags: ['字符串', '字符编码'], rate: 84,
    desc: '输入一个由小写字母组成的字符串，输出它的大写形式，并在第二行输出字符串长度。',
    input: '一行一个由小写字母组成的字符串，长度不超过 100。',
    output: '第一行输出大写字符串；第二行输出长度。',
    sampleIn: 'buaa',
    sampleOut: 'BUAA\n4',
    hint: '小写字母减 32 即得大写；也可以使用 toupper。'
  },

  /* ============ 第五章 · E5 作业赛 ============ */
  'E5-1': {
    id: 'E5-1', no: 1, contest: 'E5', unit: 5, title: '递归求阶乘',
    difficulty: '简单', tags: ['递归', '函数'], rate: 91,
    desc: '编写递归函数计算 n!，并输出结果。',
    input: '一行一个整数 n（1 ≤ n ≤ 12）。',
    output: '一行一个整数，表示 n!。',
    sampleIn: '5',
    sampleOut: '120',
    hint: 'f(n) = n * f(n-1)，f(1) = 1。'
  },
  'E5-2': {
    id: 'E5-2', no: 2, contest: 'E5', unit: 5, title: '递归求斐波那契',
    difficulty: '中等', tags: ['递归', '记忆化'], rate: 77,
    desc: '用递归求斐波那契数列的第 n 项（F(1)=1，F(2)=1）。',
    input: '一行一个整数 n（1 ≤ n ≤ 30）。',
    output: '一行一个整数，表示 F(n)。',
    sampleIn: '10',
    sampleOut: '55',
    hint: '朴素递归在 n=30 时约 130 万次调用，可以接受；再大就需要记忆化。'
  },
  'E5-3': {
    id: 'E5-3', no: 3, contest: 'E5', unit: 5, title: '汉诺塔',
    difficulty: '中等', tags: ['递归', '数学归纳'], rate: 73,
    desc: '有三根柱子，n 个大小不同的圆盘按从大到小叠在第一根柱子上。要求把所有圆盘移到第三根柱子，每次只能移动一个盘，且大盘不能压在小盘上。输出最少需要移动的次数。',
    input: '一行一个整数 n（1 ≤ n ≤ 30）。',
    output: '一行一个整数，表示最少移动次数。',
    sampleIn: '5',
    sampleOut: '31',
    hint: '经典结论：h(n) = 2h(n-1) + 1，即 2ⁿ - 1。'
  },
  'E5-4': {
    id: 'E5-4', no: 4, contest: 'E5', unit: 5, title: '回文串判定',
    difficulty: '中等', tags: ['递归', '字符串'], rate: 76,
    desc: '判断一个由小写字母组成的字符串是否为回文串（正着读和反着读相同）。要求用递归实现。',
    input: '一行一个字符串，长度不超过 100。',
    output: '是回文串输出 YES，否则输出 NO。',
    sampleIn: 'abcba',
    sampleOut: 'YES',
    hint: '比较首尾字符，相等则递归判断去掉首尾的子串。'
  },

  /* ============ 第五章 · C5 上机赛 ============ */
  'C5-1': {
    id: 'C5-1', no: 1, contest: 'C5', unit: 5, title: '递归求最大公约数',
    difficulty: '简单', tags: ['递归', '欧几里得'], rate: 89,
    desc: '使用递归实现欧几里得算法，求两个正整数的最大公约数。',
    input: '一行两个正整数 a、b（1 ≤ a, b ≤ 10⁹）。',
    output: '一行一个整数，表示最大公约数。',
    sampleIn: '12 18',
    sampleOut: '6',
    hint: 'gcd(a, b) = gcd(b, a % b)，gcd(a, 0) = a。'
  },
  'C5-2': {
    id: 'C5-2', no: 2, contest: 'C5', unit: 5, title: '快速幂',
    difficulty: '中等', tags: ['递归', '快速幂', '取模'], rate: 69,
    desc: '计算 a 的 n 次方对 1000000007 取模的结果。',
    input: '一行两个整数 a、n（1 ≤ a ≤ 10⁹，0 ≤ n ≤ 10⁹）。',
    output: '一行一个整数，表示 aⁿ mod 1000000007。',
    sampleIn: '2 10',
    sampleOut: '1024',
    hint: 'aⁿ = (a^(n/2))²，n 为奇数时再乘一个 a；每步都要取模。'
  },
  'C5-3': {
    id: 'C5-3', no: 3, contest: 'C5', unit: 5, title: '递归求数组最大值',
    difficulty: '简单', tags: ['递归', '数组'], rate: 85,
    desc: '用递归函数求数组中的最大元素。',
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）；第二行 n 个整数。',
    output: '一行一个整数，表示最大值。',
    sampleIn: '5\n3 9 2 7 5',
    sampleOut: '9',
    hint: 'max(a, n) = a[n-1] 与 max(a, n-1) 中的较大者。'
  },
  'C5-4': {
    id: 'C5-4', no: 4, contest: 'C5', unit: 5, title: '十进制转二进制',
    difficulty: '中等', tags: ['递归', '进制转换'], rate: 75,
    desc: '用递归把十进制非负整数转换成二进制并输出。',
    input: '一行一个非负整数 n（0 ≤ n ≤ 10⁹）。',
    output: '一行一个二进制数，不含前导零。',
    sampleIn: '10',
    sampleOut: '1010',
    hint: '先递归输出 n/2，再输出 n%2；注意 n = 0 时直接输出 0。'
  },

  /* ============ 第六章 · E6 作业赛 ============ */
  'E6-1': {
    id: 'E6-1', no: 1, contest: 'E6', unit: 6, title: '指针交换',
    difficulty: '简单', tags: ['指针', '地址传递'], rate: 86,
    desc: '编写函数 swap(int *a, int *b)，通过指针交换两个整数，并输出交换后的结果。',
    input: '一行两个整数 a、b。',
    output: '一行两个整数，依次为交换后的 a、b。',
    sampleIn: '1 2',
    sampleOut: '2 1',
    hint: '函数内用 *a 和 *b 操作目标变量，调用时传 &x、&y。'
  },
  'E6-2': {
    id: 'E6-2', no: 2, contest: 'E6', unit: 6, title: '结构体统计',
    difficulty: '中等', tags: ['结构体', '字符串', '遍历'], rate: 71,
    desc: '输入 n 个学生的姓名与成绩，输出平均分（保留 1 位小数）和成绩最高的学生姓名。',
    input: '第一行一个整数 n（1 ≤ n ≤ 100）；接下来 n 行，每行一个姓名（不含空格，长度不超过 20）和一个整数成绩（0 ≤ 成绩 ≤ 100）。',
    output: '第一行一个实数，表示平均分，保留 1 位小数；第二行一个字符串，表示最高分学生姓名（并列时取最先出现者）。',
    sampleIn: '3\nTom 80\nAmy 95\nBob 70',
    sampleOut: '81.7\nAmy',
    hint: '定义 struct Student { char name[21]; int score; };，边读入边累加与比较。'
  },
  'E6-3': {
    id: 'E6-3', no: 3, contest: 'E6', unit: 6, title: '单词计数',
    difficulty: '中等', tags: ['字符串', '分词'], rate: 74,
    desc: '输入一行英文句子（单词之间用单个空格分隔，不含多余空格），统计其中单词的个数。',
    input: '一行字符串，长度不超过 200。',
    output: '一行一个整数，表示单词个数。',
    sampleIn: 'I love BUAA',
    sampleOut: '3',
    hint: '读取整行用 fgets 或 gets_s；统计「由空格分隔的连续非空格片段」的个数。'
  },
  'E6-4': {
    id: 'E6-4', no: 4, contest: 'E6', unit: 6, title: '指针反转字符串',
    difficulty: '中等', tags: ['指针', '字符串'], rate: 70,
    desc: '用字符指针实现字符串反转，并输出反转后的字符串。',
    input: '一行一个不含空格的字符串，长度不超过 100。',
    output: '一行反转后的字符串。',
    sampleIn: 'oj',
    sampleOut: 'jo',
    hint: '用两个指针分别指向首尾，向中间靠拢并交换所指字符。'
  },

  /* ============ 第六章 · C6 上机赛 ============ */
  'C6-1': {
    id: 'C6-1', no: 1, contest: 'C6', unit: 6, title: '结构体排序',
    difficulty: '中等', tags: ['结构体', '排序'], rate: 68,
    desc: '输入 n 个学生的姓名与成绩，按成绩从高到低输出；成绩相同时保持输入顺序（稳定排序）。',
    input: '第一行一个整数 n（1 ≤ n ≤ 100）；接下来 n 行，每行一个姓名与一个整数成绩。',
    output: '共 n 行，每行一个姓名和一个成绩，用空格分隔。',
    sampleIn: '3\nTom 80\nAmy 95\nBob 70',
    sampleOut: 'Amy 95\nTom 80\nBob 70',
    hint: '结构体数组 + 冒泡 / 选择排序；稳定排序要求只在严格大于时才交换。'
  },
  'C6-2': {
    id: 'C6-2', no: 2, contest: 'C6', unit: 6, title: '分数段统计',
    difficulty: '中等', tags: ['结构体', '计数'], rate: 72,
    desc: '统计 n 个成绩在 [90,100]、[80,89]、[70,79]、[60,69]、[0,59] 五个分数段中的人数。',
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）；第二行 n 个整数成绩（0 ≤ 成绩 ≤ 100）。',
    output: '一行五个整数，依次为上述五个分数段的人数，用空格分隔。',
    sampleIn: '6\n95 82 71 60 55 90',
    sampleOut: '2 1 1 1 1',
    hint: '用一个长度为 5 的计数数组，按 score/10 分桶即可。'
  },
  'C6-3': {
    id: 'C6-3', no: 3, contest: 'C6', unit: 6, title: '指针拼接字符串',
    difficulty: '中等', tags: ['指针', '字符串'], rate: 70,
    desc: '输入两个不含空格的字符串，用字符指针把它们拼接成一个字符串并输出。',
    input: '两行，每行一个字符串，长度均不超过 100。',
    output: '一行，为拼接后的字符串。',
    sampleIn: 'hello\nworld',
    sampleOut: 'helloworld',
    hint: '先让指针走到第一个字符串的末尾 \\0 处，再逐字符复制第二个字符串。'
  },
  'C6-4': {
    id: 'C6-4', no: 4, contest: 'C6', unit: 6, title: '单词首字母大写',
    difficulty: '中等', tags: ['字符串', '状态标记'], rate: 73,
    desc: '输入一行由小写字母和空格组成的英文句子，把每个单词的首字母改为大写后输出，其余字符保持不变。',
    input: '一行字符串，长度不超过 200。',
    output: '一行处理后的字符串。',
    sampleIn: 'hello world buaa',
    sampleOut: 'Hello World Buaa',
    hint: '用一个标记记录「上一个字符是否为空格」，标记为真时把当前字符转大写。'
  }
};

/* ------------------------------ 排行榜 ------------------------------- */
/* 演示数据：姓名、已解决题数、总提交数 */
const RANKS = [
  { name: '26371001', ac: 46, sub: 61 },
  { name: '26371042', ac: 44, sub: 58 },
  { name: '26371017', ac: 41, sub: 63 },
  { name: '26371083', ac: 39, sub: 55 },
  { name: '26371126', ac: 37, sub: 60 },
  { name: '26371059', ac: 35, sub: 52 },
  { name: '26371004', ac: 33, sub: 58 },
  { name: '26371098', ac: 31, sub: 47 },
  { name: '26371137', ac: 29, sub: 51 },
  { name: '26371066', ac: 27, sub: 44 },
  { name: '26371022', ac: 24, sub: 43 },
  { name: '26371108', ac: 22, sub: 39 },
  { name: '26371071', ac: 19, sub: 36 },
  { name: '26371035', ac: 17, sub: 34 },
  { name: '26371089', ac: 14, sub: 30 }
];

/* ----------------------------- 工具函数 ------------------------------ */
const DATA_API = {
  allProblems() {
    return Object.keys(PROBLEMS).map(id => PROBLEMS[id]);
  },
  problemsOf(contestId) {
    return this.allProblems()
      .filter(p => p.contest === contestId)
      .sort((a, b) => a.no - b.no);
  },
  contest(contestId) {
    return CONTESTS.find(c => c.id === contestId) || null;
  },
  unit(n) {
    return UNITS.find(u => u.n === n) || null;
  },
  contestsOfUnit(n) {
    return CONTESTS.filter(c => c.unit === n)
      .sort((a, b) => (a.kind === 'homework' ? -1 : 1) - (b.kind === 'homework' ? -1 : 1));
  },
  /** 比赛状态：upcoming / live / ended */
  statusOf(contest) {
    const now = Date.now();
    const start = new Date(contest.start.replace(' ', 'T')).getTime();
    const end = new Date(contest.end.replace(' ', 'T')).getTime();
    if (now < start) return 'upcoming';
    if (now <= end) return 'live';
    return 'ended';
  },
  statusLabel(status) {
    return { upcoming: '未开始', live: '进行中', ended: '已结束' }[status] || '';
  },
  /** 题目所属比赛的展示名，例如 "E1 第一次作业赛" */
  contestLabel(contestId) {
    const c = this.contest(contestId);
    return c ? `${c.id} ${c.title}` : contestId;
  }
};
