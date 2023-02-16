import clsx from 'clsx'
import Link from 'next/link'
import { useEffect } from 'react'

import useDids from '../hooks/use-dids'
import useRouterQuery from '../hooks/use-router-query'
import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import {
  Authorization,
  authorizationMessage,
  setAuthorization,
  setAuthorizationCurrent,
} from '../utils/authorization'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'

export default function SubscriptionList(props: { className?: string }) {
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const { data, error } = trpc.subscription.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })
  const handleSignDocument = useSignDocument<Authorization>(dids?.[0])
  useEffect(() => {
    setAuthorizationCurrent(dids?.[0])
  }, [dids])
  useEffect(() => {
    if (error?.data?.code === 'UNAUTHORIZED') {
      handleSignDocument({ message: authorizationMessage }).then((signed) => {
        if (signed) {
          setAuthorization(signed)
        }
      })
    }
  }, [error?.data?.code, handleSignDocument])

  return (
    <div className={props.className}>
      {data?.map((community) => (
        <Link key={community.author.did} href={`/${community.author.did}`}>
          <Avatar
            size={12}
            name={community.author.did}
            value={community.extension?.avatar}
            className={clsx(
              'mt-4 ring-2 ring-offset-2',
              community.author.did === query.entry
                ? 'ring-indigo-500'
                : 'ring-transparent hover:ring-gray-300',
            )}
          />
        </Link>
      ))}
    </div>
  )
}
