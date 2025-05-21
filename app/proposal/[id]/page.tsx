'use client'

import { useParams } from 'next/navigation'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed
import { web3, AnchorError, AnchorProvider, BN } from '@project-serum/anchor'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import Link from 'next/link'
import { getAccount } from '@solana/spl-token'
import { string } from 'zod'

interface Proposal {
  owner: string
  title: string
  brief: string
  cate: string
  hasVoted: boolean
  votePower: number
}
export default function ShowProposal() {
  const { id } = useParams()

  const { publicKey } = useWallet()

  const [isLoading, setLoading] = useState(true)
  const [isVoteLoading, setVoteLoading] = useState(false)

  const [details, setDetails] = useState<Proposal | null>(null)
  const [notice, setNotice] = useState({ msg: '', type: '' })

  useEffect(() => {
    const fetchProposal = async () => {
      if (id && typeof id === 'string') {
        try {
          const data = await getProposal(id) // Await the result of the async call
          // Set the details when data is fetched
          console.log(data)

          setDetails(data)
        } catch (error) {
          console.error(error)
        }
      }
    }

    fetchProposal() // Call the async function
  }, [id])

  const getProposal = async (key: string) => {
    setLoading(true)
    const proposalPublicKey = new PublicKey(key)
    const program = getProgram()
    const provider = program.provider as AnchorProvider

    try {
      const proposal = await program.account.proposal.fetch(proposalPublicKey)

      let voteData = { hasVoted: false, votePower: 0 }

      //Check user vote
      if (publicKey) {
        const [pdaPublicKey] = await PublicKey.findProgramAddressSync(
          [
            Buffer.from('vote-record'),
            proposalPublicKey.toBuffer(),
            provider.wallet.publicKey.toBuffer()
          ],
          program.programId
        )

        try {
          const proposalVote = await program.account.voteRecord.fetch(
            pdaPublicKey
          )
          voteData.hasVoted = proposalVote.hasVoted as boolean
          voteData.votePower = proposalVote.votePower as number
        } catch {
          voteData.hasVoted = false
          voteData.votePower = 0
        }
      }
      //End check user vote

      return {
        owner: proposal.owner,
        title: proposal.title,
        brief: proposal.brief,
        cate: proposal.cate,
        expiresAt: Number(proposal.expiresAt),
        hasVoted: voteData.hasVoted,
        votePower: Number(voteData.votePower),
        agreeVotes: Number(proposal.agreeVotes),
        disagreeVotes: Number(proposal.disagreeVotes)
      } as Proposal
    } catch (err) {
      throw new Error('Load Error')
    } finally {
      setLoading(false)
    }
  }

  function convertUrlsToLinks(text: string) {
    const urlRegex = /https:\/\/[^\s]+/g // Regular expression to match https URLs
    return text.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    )
  }

  //Submti vote
  const voteProposal = async (agree: boolean) => {
    setVoteLoading(true)
    setNotice({ msg: '', type: '' })

    const mintId = process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN_MINT_ID

    const program = getProgram()
    const mintAccountPublicKey = new PublicKey(mintId as string)
    if (publicKey)
      try {
        let response =
          await program.provider.connection.getParsedTokenAccountsByOwner(
            publicKey,
            {
              mint: mintAccountPublicKey
            }
          )

        let votePower = 0
        let tokenDecimal = 9
        response.value.forEach((accountInfo) => {
          tokenDecimal = Number(
            accountInfo.account.data['parsed']['info']['tokenAmount'][
              'decimals'
            ]
          )
          votePower += Number(
            accountInfo.account.data['parsed']['info']['tokenAmount']['amount']
          )
        })

        votePower = votePower / Math.pow(10, tokenDecimal)

        if (votePower > 0) {
          try {
            const provider = program.provider as AnchorProvider

            if (id && typeof id === 'string') {
              // Call the `vote proposal` instruction defined in the IDL
              const proposalPublicKey = new PublicKey(id)
              const [pdaPublicKey] = await PublicKey.findProgramAddressSync(
                [
                  Buffer.from('vote-record'),
                  proposalPublicKey.toBuffer(),
                  provider.wallet.publicKey.toBuffer()
                ],
                program.programId
              )

              try {
                await program.methods
                  .vote(agree, new BN(votePower))
                  .accounts({
                    proposal: id,
                    voter: provider.wallet.publicKey,
                    voteRecord: pdaPublicKey,
                    systemProgram: web3.SystemProgram.programId
                  })
                  .rpc()
                setNotice({ msg: 'Voted successfully', type: 'success' })
              } catch (err) {
                setNotice({ msg: `${err}`, type: 'err' })
              }
            } else throw new Error("Can't fint proposal")
          } catch (err) {
            if (err instanceof AnchorError) {
              setNotice({ msg: err.error.errorMessage, type: 'err' })
            } else {
              setNotice({ msg: `TransactionError: ${err}`, type: 'err' })
            }
          } finally {
            setVoteLoading(false)
          }
        } else {
          setNotice({ msg: "You don't have any MB2B token", type: 'err' })
        }
      } catch (err) {
        console.log(err)
      }
  }

  return (
    <div className="grid grid-rows-[10px_1fr_10px] max-w-full   items-top justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 row-start-2 items-center sm:items-start">
        {!isLoading ? (
          <div>
            <Link
              href="/"
              className="btn btn-error btn-outline  mb-2"
            >
              Back
            </Link>
            <div className="card bg-base-100 w-full max-w-full shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  {details?.title}
                  <div
                    className={`badge ${
                      details?.cate === 'fund'
                        ? 'badge-secondary'
                        : 'badge-success'
                    }`}
                  >
                    {details?.cate === 'fund' ? 'REQUEST FUND' : 'NEW IDEA'}
                  </div>
                </h2>
                <div
                  className=" break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: convertUrlsToLinks(details ? details.brief : '')
                  }}
                />

                <div className="card-actions justify-end">
                  {publicKey ? (
                    <div>
                      {!details?.hasVoted ? (
                        <div>
                          <button
                            onClick={() => voteProposal(true)}
                            className="btn btn-outline btn-success mr-1 "
                          >
                            {!isVoteLoading ? (
                              'Agree'
                            ) : (
                              <span className="loading loading-spinner loading-sm"></span>
                            )}
                          </button>
                          <button
                            onClick={() => voteProposal(false)}
                            className="btn btn-outline btn-error"
                          >
                            {!isVoteLoading ? (
                              'Disagree'
                            ) : (
                              <span className="loading loading-spinner loading-sm"></span>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-bold text-amber-900 font-bold	">
                          You already voted
                        </div>
                      )}

                      {notice ? (
                        <p
                          className={`text-center mt-4 ${
                            notice.type === 'err'
                              ? 'text-error'
                              : 'text-success'
                          }`}
                        >
                          {notice?.msg}
                        </p>
                      ) : (
                        ''
                      )}
                    </div>
                  ) : (
                    <div className="text-bold text-amber-900 font-bold	">
                      Connect your wallet to vote
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading ...</div>
        )}
      </main>
    </div>
  )
}
