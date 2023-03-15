import Article from '../../../components/basic/article'
import Markdown from '../../../components/basic/markdown'
import TextButton from '../../../components/basic/text-button'
import useRouterQuery from '../../../hooks/use-router-query'
import { permalink2Id } from '../../../utils/permalink'
import { trpc } from '../../../utils/trpc'

export default function OptionPage() {
  const query = useRouterQuery<['proposal', 'option']>()
  const { data: option } = trpc.option.getByPermalink.useQuery(
    { permalink: query.option },
    { enabled: !!query.option, refetchOnWindowFocus: false },
  )

  return (
    <div className="w-full">
      <TextButton
        disabled={!query.proposal}
        href={
          query.proposal ? `/round/${permalink2Id(query.proposal)}` : undefined
        }
        className="mt-6 sm:mt-8"
      >
        <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
      </TextButton>
      <h1 className="mt-6 text-4xl font-medium text-gray-900 sm:mt-8">
        {option?.title}
      </h1>
      <Article className="w-full pt-6">
        <Markdown>{option?.extension?.content}</Markdown>
      </Article>
    </div>
  )
}
