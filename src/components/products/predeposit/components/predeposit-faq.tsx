import Image from "next/image"

export const PredepositFAQ = () => {
  //   const faq = [
  //     {
  //       title: "How it works?",
  //       content: [
  //         "Deposit USDC or frxUSD to participate in USG’s pre-deposit campaign.",
  //         "Your deposit will be routed in the corresponding Curve pool.",
  //         "In return, you will receive a LP token representing your position in the liquidity pool.",
  //       ],
  //     },
  //     {
  //       title: "What do I get after depositing?",
  //       content: [
  //         "By depositing, you will receive a Curve LP token that represents your participation in the liquidity pool. ",
  //         "Once you receive your LP tokens, your position is comprised of a mix of USDC/frxUSD, and USG.",
  //         "You can keep your LP token as it is, or stake it to receive CRV rewards.",
  //       ],
  //     },
  //     {
  //       title: "Can I stake my LP tokens?",
  //       content: ["By participating in the pre-deposit campaign, you will earn"],
  //       bulletPoints: [
  //         "A fixed portion of the 2% of TAN tokens dedicated to the campaign, proportional to your deposit",
  //         "A 2x boost for the regular airdrop campaign, which 10% of TAN’s total supply is dedicated to",
  //         "Trading fees, and CRV rewards if you decide to stake your LP tokens.",
  //       ],
  //     },
  //     {
  //       title: "Do I need to keep my position until the end of the campaign?",
  //       content: [
  //         "Yes, once the retention phase starts, you need to keep your position until the end of the campaign to be eligible for rewards.",
  //         "However, there is no enforced lock-up, and you can withdraw at any time.",
  //         "If you withdraw totally, you will lose your eligibility even if you redeposit after. If you withdraw partially, your minimum deposit will be taken into account.",
  //         "If you withdraw, you will keep the points you earned for the regular airdrop campaign.",
  //       ],
  //     },
  //     {
  //       title: "Do I score points for the regular airdrop campaign?",
  //       content: [
  //         "Yes. You can choose not to stake your LP tokens to maximize your points.",
  //         "By staking your LP tokens, you will earn CRV rewards, but you will receive fewer points.",
  //         "Staking or not doesn’t affect your pre-deposit campaign’s rewards.",
  //       ],
  //     },
  //     {
  //       title: "Is it safe?",
  //       content: [
  //         "Tangent was thoroughly audited by top firms and security researchers, and went through 4 audits and extensive testing.",
  //         "You can read about audits here: https://docs.tangent.finance/docs/faq/audits.",
  //         "However, audits don’t ensure that there are no smart contract risks. By participating in the pre-deposit campaign, you must assume that there is a risk of partial or total loss of funds.",
  //       ],
  //     },
  //   ]

  return (
    <>
      <div className="mt-4 flex w-full items-center justify-between rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <span className="px-12 text-4xl font-semibold text-white">F.A.Q</span>
        <Image src="/medias/faq.png" alt="image" width={360} height={120} />
      </div>
    </>
  )
}
