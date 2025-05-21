import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'

export async function POST(request: NextRequest) {
  const { address } = await request.json()

  if (!address || typeof address !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing address' },
      { status: 400 }
    )
  }

  try {
    // Check if the address is a valid Solana PublicKey
    const publicKey = new PublicKey(address)

    // Ensure it can convert back to a string (round-trip validation)
    if (publicKey.toBase58() === address) {
      return NextResponse.json(
        { valid: true, message: 'Address is valid.' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { valid: false, message: 'Address is not valid.' },
        { status: 400 }
      )
    }
  } catch {
    // If an error occurs, it means the address is invalid
    return NextResponse.json(
      { valid: false, message: 'Address is not valid.' },
      { status: 400 }
    )
  }
}
