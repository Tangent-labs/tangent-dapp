import Link from "next/link"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export const PredepositFAQ = () => {
  const faq = [
    {
      title: "How it works?",
      content: [
        "Deposit USDC or frxUSD to participate in USG’s pre-deposit campaign. Your deposit will be routed in the corresponding Curve pool. In return, you will receive a LP token representing your position in the liquidity pool.",
      ],
    },
    {
      title: "What do I get after depositing?",
      content: [
        "By depositing, you will receive a Curve LP token that represents your participation in the liquidity pool. Once you receive your LP tokens, your position is comprised of a mix of USDC/frxUSD, and USG",
        "You can keep your LP token as it is, or stake it to receive CRV rewards.",
      ],
    },

    {
      title: "Can I stake my LP tokens?",
      content: [
        "Yes, you can stake your LP tokens directly on Curve, or on boosters like Convex Finance, or Stake DAO. ",
        "Staking your LP tokens will earn you fewer points, but you will receive CRV rewards.",
      ],
    },
    {
      title: "What do I earn by depositing?",
      content: ["By participating in the pre-deposit campaign, you will earn:"],
      bulletPoints: [
        "A fixed portion of the 2% of TAN tokens dedicated to the campaign, proportional to your deposit",
        "A 2x boost for the regular airdrop campaign, which 10% of TAN’s total supply is dedicated to",
        "Trading fees, and CRV rewards if you decide to stake your LP tokens.",
      ],
    },
    {
      title: "Do I need to keep my position until the end of the campaign?",
      content: [
        "Yes, once the retention phase starts, you need to keep your position until the end of the campaign to be eligible for rewards. However, there is no enforced lock-up, and you can withdraw at any time.",
        "If you withdraw totally, you will lose your eligibility even if you redeposit after. If you withdraw partially, your minimum deposit will be taken into account.",
        "If you withdraw, you will keep the points you earned for the regular airdrop campaign.",
      ],
    },
    {
      title: "Do I score points for the regular airdrop campaign?",
      content: [
        "Yes. You can choose not to stake your LP tokens to maximize your points. By staking your LP tokens, you will earn CRV rewards, but you will receive fewer points.",
        "Staking or not doesn’t affect your pre-deposit campaign’s rewards.",
      ],
    },
    {
      title: "Is it safe?",
      content: [
        "Tangent was thoroughly audited by top firms and security researchers, and went through 4 audits and extensive testing.",

        <>
          You can read about audits here:{" "}
          <Link
            href="https://docs.tangent.finance/docs/faq/audits"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300"
          >
            https://docs.tangent.finance/docs/faq/audits
          </Link>
          .
        </>,
        "However, audits don’t ensure that there are no smart contract risks. By participating in the pre-deposit campaign, you must assume that there is a risk of partial or total loss of funds.",
      ],
    },
    {
      title: "Can USG depeg?",
      content: [
        " USG can slightly derive from its $1 peg. However, the protocol is economically built so depeg situations don’t last.",
        "If the stablecoin derives from its peg, liquidity providers will earn more CRV rewards, as more incentives will be driven towards vote incentives.",
        <>
          Read more here:{" "}
          <Link
            href="https://docs.tangent.finance/docs/usg/peg-stability"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300"
          >
            https://docs.tangent.finance/docs/usg/peg-stability
          </Link>
          .
        </>,
      ],
    },
  ]

  return (
    <>
      <ReliefCard className="mb-1 mt-6 flex w-full items-center justify-between rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <span className="px-4 text-2xl font-semibold text-white lg:px-12 lg:text-4xl">F.A.Q</span>
        <Image className="w-56 lg:w-80" src="/medias/faq.png" alt="image" width={360} height={120} />
      </ReliefCard>

      {faq.map((el) => (
        <Accordion key={el.title} className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <div className="my-1 flex cursor-pointer flex-col rounded-[10px] bg-white bg-opacity-[3%] p-3">
              <AccordionTrigger>
                <span className="py-1.5 text-start text-sm font-semibold text-white lg:text-xl">{el.title}</span>
              </AccordionTrigger>

              <AccordionContent className="w-full">
                <div className="flex w-full flex-col items-start justify-start gap-1">
                  {el.content.map((content, j) => (
                    <span key={j} className="mb-1 text-xs text-subtitle lg:text-sm">
                      {content}
                    </span>
                  ))}

                  {!!el?.bulletPoints && (
                    <ul className="ml-4 mt-2">
                      {el.bulletPoints.map((b, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-subtitle lg:text-sm">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white opacity-60" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
