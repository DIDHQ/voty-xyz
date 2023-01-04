import { useState } from 'react'
import { Button } from 'react-daisyui'
import { Star } from '@icon-park/react'
import Avatar from 'boring-avatars'

type OrgCardProps = {
  avatarUrl?: string
  did: string
  name: string
  members: number
}

export default function OrgCard(props: OrgCardProps) {
  const [isFavorite, setFavorite] = useState(false)
  const toggleFavorite = () => {
    setFavorite(!isFavorite)
  }
  const { avatarUrl, name, did, members } = props

  return (
    <div className="group transition card w-52 bg-base-100 shadow-xl bg-base-200 hover:-translate-y-1">
      <figure className="px-5 pt-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="rounded-full" />
        ) : (
          <Avatar size={'10.5rem'} name={did} variant="pixel" />
        )}
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
