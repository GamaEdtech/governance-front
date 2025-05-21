import Image from 'next/image'
import ProposalList from './components/home/ProposalList'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="grid grid-rows-[10px_1fr_10px] items-top justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 row-start-2 items-center sm:items-start">
        <div className="d-flex">
          <Link
            href="/proposal/create"
            className="btn btn-primary mb-8 mr-2"
          >
            Create Proposal
          </Link>
          <a
            className="btn btn-success"
            target="_blank"
            href="https://www.orca.so/?tokenIn=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&tokenOut=BdLaNH3m6da2jXkx6XpGwLkUEKB4EbQWxLxntv5BuvAn"
          >
            Buy MB2B Token
          </a>
        </div>
        <div className="prose">
          <h1 className="mb-4 text-lg font-bold ">Proposal List</h1>
          <ProposalList />
        </div>
        {/* <p>
          For Review, Voting and Create Proposal Connect your Wallet and also
          you need first have some MB2B Token
        </p> */}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
      </footer>
    </div>
  )
}
