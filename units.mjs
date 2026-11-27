// Shared course catalogue: both course navigation and the word drawer use it.
export const UNITS=[
  {id:1,name:'Unit 1',topic:'文具与教室',companion:'灰兔',image:'assets/bunny.png',course:'index.html'},
  {id:2,name:'Unit 2',topic:'家人、身体与外貌',companion:'小红花',image:'assets/unit2/小红花-角色立绘.webp',course:'unit2.html'},
  {id:3,name:'Unit 3',topic:'农场动物与特征',companion:'玲娜贝儿',image:'unit3/assets/linabell.png',course:'unit3/'},
  {id:4,name:'Unit 4',topic:'食物、喜好与野餐分享',companion:'伊布',image:'unit4/assets/hero.png',course:'unit4/',sprite:{file:'unit4/assets/eevee.png',width:1536,height:1024,rect:[0,0,512,480]}},
  {id:5,name:'Unit 5',topic:'玩具、生日愿望与礼物归属',companion:'小黄鸭',image:'unit5/assets/duck-master.webp',course:'unit5/'},
  {id:6,name:'Unit 6',topic:'出游、街景与动物',companion:'长颈鹿',image:'unit6/art/guide.webp',course:'unit6/'},
  {id:7,name:'Unit 7',topic:'运动、爱好与阳光运动会',companion:'拉布布',image:'unit7/art/guide.webp',course:'unit7/'}
];
export function unitArt(unit,url=path=>path){
  return `<img src="${url('assets/unit-avatars/'+unit.id+'.webp')}" alt="${unit.companion}" width="192" height="192" decoding="async">`;
}
