'use client'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils'
import { ProgramAccount } from '@project-serum/anchor'
import { web3, AnchorError, AnchorProvider } from '@project-serum/anchor'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
interface Proposal {
  id: PublicKey
  owner: PublicKey
  title: string
  brief: string
  cate: string
  reference: string
  amount: string
  createdAt: Date
  expiresAt: Date
  resultStatus: string
  agreeVotes: number
  disagreeVotes: number
}

export default function ProposalList() {
  const { publicKey } = useWallet()
  const [proposals, setProposals] = useState<Array<Proposal>>([])
  const [listLoading, setListLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [notice, setNotice] = useState({ msg: '', type: '' })

  useEffect(() => {
    getProposalList()
  }, [])

  const getProposalList = async () => {
    const program = getProgram()

    try {
      // Fetch all accounts for the program where the owner is the user's public key
      const proposals = await program.account.proposal.all()

      const proposalArray: Proposal[] = proposals.map(
        (proposal: ProgramAccount<any>) => ({
          id: proposal.publicKey,
          owner: proposal.account.owner, // Convert the owner publicKey to base58
          title: proposal.account.title,
          brief: proposal.account.brief,
          cate: proposal.account.cate,
          reference: proposal.account.reference,
          amount: proposal.account.amount,
          createdAt: new Date(proposal.account.createdAt.toNumber() * 1000),
          expiresAt: new Date(proposal.account.expiresAt.toNumber() * 1000),
          agreeVotes: proposal.account.agreeVotes,
          disagreeVotes: proposal.account.disagreeVotes,
          resultStatus:
            dayjs(new Date()).unix() < proposal.account.expiresAt
              ? 'Active'
              : proposal.account.agreeVotes.toNumber() >
                proposal.account.disagreeVotes.toNumber()
              ? 'Passed'
              : 'Rejected'
        })
      )

      const sortedProposals = proposalArray.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })

      setProposals(sortedProposals)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
    } finally {
      setListLoading(false)
    }
  }

  const deleteProposal = async (proposal: PublicKey) => {
    setDeleteLoading(true)

    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the proposal

      // Call the `delete proposal` instruction defined in the IDL
      await program.methods
        .deleteProposal()
        .accounts({
          proposal: proposal,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc()

      setNotice({ msg: 'Deleted successfully', type: 'success' })
      getProposalList()
    } catch (err) {
      if (err instanceof AnchorError) {
        setNotice({ msg: err.error.errorMessage, type: 'err' })
      } else {
        setNotice({ msg: `TransactionError: ${err}`, type: 'err' })
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      {!listLoading ? (
        <div>
          {proposals.length ? (
            <div>
              <p
                className={`text-center my-4 ${
                  notice.type === 'err' ? 'text-error' : 'text-success'
                }`}
              >
                {notice?.msg}
              </p>
              <table className="w-full  table-auto mx-auto mb-14">
                <thead>
                  <tr>
                    <th className="text-left min-w-[180px]">Title</th>
                    <th className="text-left min-w-[180px]">Type</th>
                    <th className="text-left min-w-[200px]">Expiry Date</th>
                    <th className="text-left min-w-[200px]">Status</th>
                    <th className="text-left min-w-[180px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal, index) => (
                    <tr key={index}>
                      <td className="pl-1 pr-4">{proposal.title}</td>
                      <td className="py-2">
                        <div
                          className={`badge ${
                            proposal.cate === 'fund'
                              ? 'badge-secondary'
                              : 'badge-success'
                          }`}
                        >
                          {proposal.cate === 'fund'
                            ? 'Request fund'
                            : 'New Idea'}
                        </div>
                      </td>
                      <td className="py-2">
                        {proposal.expiresAt.toDateString()}
                      </td>
                      <td>
                        <div
                          className={`badge ${
                            proposal.resultStatus === 'Active'
                              ? 'badge-primary'
                              : proposal.resultStatus == 'Passed'
                              ? 'badge-success'
                              : 'badge-error'
                          }`}
                        >
                          {proposal.resultStatus}
                        </div>
                      </td>

                      <td className="py-2">
                        <Link
                          href={`/proposal/${proposal.id}`}
                          className="btn btn-outline btn-xs btn-success mr-1"
                        >
                          Show
                        </Link>
                        {
                          <span>
                            {publicKey?.toBase58() ===
                              proposal.owner.toBase58() &&
                            proposal.resultStatus !== 'Passed' ? (
                              <button
                                onClick={() => deleteProposal(proposal.id)}
                                className="btn btn-outline btn-xs btn-error "
                              >
                                {!deleteLoading ? (
                                  'Delete'
                                ) : (
                                  <span>Loading...</span>
                                )}
                              </button>
                            ) : (
                              ''
                            )}
                          </span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>Opps! not found any proposal</div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <span className="loading loading-ball loading-sm " />
          <span className="loading loading-ball loading-sm" />
          <span className="loading loading-ball loading-md" />
          <span className="loading loading-ball loading-lg" />
        </div>
      )}
    </div>
  )
}
