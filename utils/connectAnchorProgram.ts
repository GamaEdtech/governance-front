import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, Idl } from '@project-serum/anchor'
import idl from './idl/gamaedtech_program.json'

//Check program id in env file
const ProgramID = process.env.NEXT_PUBLIC_PROGRAM_ID;
if (!ProgramID) throw new Error('ProgramId is missing!')
//End check program id in env file

const programID = new PublicKey(ProgramID)

export const getProvider = () => {
  if (!window.solana) {
    throw new Error(
      'Solana object not found in window. Ensure you are using a Solana wallet.'
    )
  }

  // Create a new connection to the Solana cluster
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
  if (!rpcUrl) throw new Error('RPC URL missing!')
  const connection = new Connection(rpcUrl, 'processed') // Change to your preferred cluster

  // Create a provider using the new AnchorProvider class
  const provider = new AnchorProvider(
    connection,
    window.solana,
    AnchorProvider.defaultOptions()
  )

  return provider
}

export const getProgram = () => {
  const provider = getProvider()
  return new Program(idl as Idl, programID, provider)
}
