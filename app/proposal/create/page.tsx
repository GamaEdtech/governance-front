'use client'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed
import { BN, web3, AnchorError, AnchorProvider } from '@project-serum/anchor'
import { useState } from 'react'
import { titleSchema, briefSchema } from '@/utils/validationSchemas'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'

export default function CreateProposal() {
  const { publicKey } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [cate, setCate] = useState('')
  const [reference, setReference] = useState('')
  const [amount, setAmount] = useState(0)
  const [brief, setBreif] = useState('')
  const [notice, setNotice] = useState({ msg: '', type: '' })

  const submitProposal = async () => {
    // Validate the IP address using Zod schema
    const titleValidation = titleSchema.safeParse(title)
    const briefValidation = briefSchema.safeParse(brief)

    if (titleValidation.success) {
      // Clear error and proceed with the valid IP address
      setNotice({ msg: '', type: '' })
    } else {
      // Set error message if validation fails
      setNotice({
        msg: titleValidation.error.errors[0].message,
        type: 'err'
      })
      return
    }

    if (briefValidation.success) {
      // Clear error and proceed with the valid IP address
      setNotice({ msg: '', type: '' })
    } else {
      // Set error message if validation fails
      setNotice({
        msg: briefValidation.error.errors[0].message,
        type: 'err'
      })
      return
    }
    // return
    setIsLoading(true)

    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the proposal
      const proposal = web3.Keypair.generate()

      // Call the `submit proposal` instruction defined in the IDL
      console.log('here' + reference)
      await program.methods
        .createProposal(title, brief, cate, reference, new BN(amount))
        .accounts({
          proposal: proposal.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .signers([proposal])
        .rpc()

      setNotice({ msg: 'Proposal submited successfully', type: 'success' })
    } catch (err) {
      if (err instanceof AnchorError) {
        setNotice({ msg: err.error.errorMessage, type: 'err' })
      } else {
        setNotice({ msg: `TransactionError: ${err}`, type: 'err' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-top justify-center w-full min-h-screen p-8 pb-20">
      {publicKey ? (
        <div className="w-full max-w-lg">
          <h1 className="my-4 text-lg font-bold">Create New Proposal</h1>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="input input-bordered w-full mb-4"
          />
          <select
            onChange={(e) => setCate(e.target.value)}
            className="select select-bordered w-full  mb-4"
          >
            <option value="idea">Initil Idea</option>
            <option value="fund">Request Fund</option>
          </select>

          {cate === 'fund' && (
            <div>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Initial Idea Id"
                className="input input-bordered w-full mb-4"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Amount($GET)"
                className="input input-bordered w-full mb-4"
              />
            </div>
          )}
          <div>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Just brief data, Share extra data as google doc"
              value={brief}
              onChange={(e) => setBreif(e.target.value)}
              maxLength={800}
              rows={10}
            ></textarea>
          </div>
          {/* <div>
          <textarea
            className="textarea textarea-bordered w-full mb-4"
            rows={10}
            placeholder="Full Describe"
          ></textarea>
          <Editor />
        </div> */}
          <button
            onClick={() => submitProposal()}
            className="btn btn-primary w-full"
          >
            {!isLoading ? (
              'Submit'
            ) : (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </button>
          <Link
            href="/"
            className="btn btn-error btn-outline w-full mt-2"
          >
            Back
          </Link>

          <p
            className={`text-center mt-4 ${
              notice.type === 'err' ? 'text-error' : 'text-success'
            }`}
          >
            {notice?.msg}
          </p>
        </div>
      ) : (
        <h1 className="text-center">Wallet is not connected</h1>
      )}
    </div>
  )
}
