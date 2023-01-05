import { useState } from 'react'
import { Button } from 'react-daisyui'
import { Star } from '@icon-park/react'
import AvatarInput from './avatar-input'

type OrganizationCardProps = {
  avatarUrl?: string
  did: string
  name: string
  members: number
}

export default function OrganizationCard(props: OrganizationCardProps) {
  const [isFavorite, setFavorite] = useState(false)
  const toggleFavorite = () => {
    setFavorite(!isFavorite)
  }
  const { avatarUrl, name, did, members } = props

  return (
    <div className="group transition card w-52 shadow-xl bg-base-200 hover:-translate-y-1">
      <figure className="px-5 pt-5">
        <AvatarInput name={did} value={avatarUrl} size={'10.5rem'} disabled />
      </figure>
      <div className="card-body items-center text-center p-4">
        <h1 className="card-title">{name}</h1>
        <p>{members} Members</p>
        <div className="card-actions mt-2">
          <Button color="primary" size="md">
            Enter
          </Button>
        </div>
        <Star
          className="absolute right-4 bottom-4 cursor-pointer invisible group-hover:visible"
          theme={isFavorite ? 'filled' : 'outline'}
          onClick={toggleFavorite}
        />
      </div>
    </div>
  )
}
