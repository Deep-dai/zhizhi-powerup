// Match the wallet's rule for each claim, including both sticker collections.
export function stickerRewardState(claim){
  if(claim.redeemed_entry_id)return 'redeemed';
  return claim.upgraded_at&&claim.reviews?.length===3?'eligible':'pending';
}
export function eligibleStickers(snapshot){
  return [...(snapshot?.claims||[]),...(snapshot?.pokemon_claims||[])].filter(claim=>stickerRewardState(claim)==='eligible');
}
