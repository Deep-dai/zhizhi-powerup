const entries = [
  ['bus', '公共汽车', "There's a bus at the bus stop."],
  ['bus stop', '公交站', "Let's go to the bus stop."],
  ['car', '小汽车', "There's a car in the street."],
  ['flower', '花', 'There are three flowers in the garden.'],
  ['garden', '花园', 'There are flowers in the garden.', 'yard'],
  ['lorry', '卡车', "There's a big lorry.", 'truck'],
  ['motorbike', '摩托车', 'Is there a motorbike?', 'motorcycle'],
  ['park', '公园', "Let's go to the park."],
  ['shop', '商店', 'Is there a shop?', 'store'],
  ['train', '火车', "Let's take the train."],
  ['tree', '树', 'There are two trees in the park.'],
  ['bear', '熊', "There's a bear by the tree."],
  ['crocodile', '鳄鱼', 'Is there a crocodile in the water?'],
  ['elephant', '大象', "There's an elephant."],
  ['giraffe', '长颈鹿', "Let's look at the giraffes."],
  ['hippo', '河马', 'There are two hippos in the water.'],
  ['lizard', '蜥蜴', "There's a lizard on the rock."],
  ['monkey', '猴子', 'Are there any monkeys?'],
  ['snake', '蛇', "There's a snake under the tree."],
  ['tiger', '老虎', 'There are two tigers.'],
  ['zebra', '斑马', 'There are two zebras.'],
  ['polar bear', '北极熊', "There's a polar bear on the ice."],
  ['zoo', '动物园', "Let's go to the zoo."]
];

export const words = entries.map(([word, zh, example, alias = ''], index) => ({
  word, zh, example, alias,
  id: word.replaceAll(' ', '-'),
  category: index < 11 ? '出游与街景' : '动物与动物园',
  note: word === 'garden' ? '描述住宅周围的院子时，教材也列出美式说法 yard。' : ''
}));
