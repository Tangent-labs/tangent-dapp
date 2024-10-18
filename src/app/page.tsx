import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <nav>
        <ul>
          <li>
            {" "}
            <Link href="/liquid-wrappers"> liquid-wrappers</Link>
          </li>
          <li>
            {" "}
            <Link href="/llama-split"> llama-split</Link>
          </li>
          <li>
            {" "}
            <Link href="/sdtokens-booster"> sdtokens-booster</Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
