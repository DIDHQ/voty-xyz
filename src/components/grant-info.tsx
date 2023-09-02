import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Grant } from '../utils/schemas/v1/grant'
import { PreviewPermalink } from '../utils/types'
import { permalink2Explorer } from '../utils/permalink'
import { formatNumber } from '../utils/number'
import { format2Time } from '../utils/time'
import useStatus from '../hooks/use-status'
import { DetailItem } from './basic/detail'
import TextLink from './basic/text-link'
import GrantCurrentPhase from './grant-current-phase'
import Article from './basic/article'
import Tooltip from './basic/tooltip'
import TextButton from './basic/text-button'
import Slide from './basic/slide'
import PermissionCard from './permission-card'
import Card from './basic/card'

export default function GrantInfo(props: {
  community?: Omit<Community, 'logo'>
  grant?: Grant & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const { data: status } = useStatus(props.grant?.permalink)
  const disabled = props.grant?.permalink === previewPermalink

  return (
    <div className={props.className}>
      <GrantCurrentPhase
        grantPermalink={props.grant?.permalink}
        duration={props.grant?.duration}
      />

      <Card title="Grant package">
        <p className="text-sm font-bold text-highlight">
          {props.grant?.funding[0] ? (
            <>
              {props.grant.funding[0][0]} <span>✕</span>{' '}
              {props.grant.funding[0][1]}
            </>
          ) : (
            '...'
          )}
        </p>
      </Card>

      <Card title="Information">
        <DetailItem title="Community">
          {props.community ? (
            <TextLink
              underline
              disabled={disabled}
              href={`/${props.community.id}`}
              className="block truncate whitespace-nowrap"
            >
              {props.community.name}
            </TextLink>
          ) : (
            '...'
          )}
        </DetailItem>

        {props.grant?.permission.selecting ? (
          <DetailItem className="flex justify-end" title="Committees">
            {props.community ? (
              <Slide
                title={`Committee of ${props.grant.name}`}
                trigger={({ handleOpen }) => (
                  <TextButton
                    onClick={handleOpen}
                    className="inline-block truncate whitespace-nowrap text-strong underline enabled:hover:text-primary-500"
                  >
                    {
                      props.grant?.permission.selecting?.operands[0]
                        ?.arguments[1].length
                    }{' '}
                    member
                    {props.grant?.permission.selecting?.operands[0]
                      ?.arguments[1].length &&
                    props.grant?.permission.selecting?.operands[0].arguments[1]
                      .length > 1
                      ? 's'
                      : ''}
                  </TextButton>
                )}
              >
                {() =>
                  props.grant?.permission.selecting ? (
                    <PermissionCard
                      title="Committee"
                      description="Only proposals selected by committee members are eligible to be voted on."
                      value={props.grant.permission.selecting}
                    />
                  ) : null
                }
              </Slide>
            ) : (
              '...'
            )}
          </DetailItem>
        ) : null}
      </Card>

      {props.grant?.snapshots ? (
        <Card title="On-chain verification">
          <DetailItem title="Snapshot">
            <TextLink
              underline
              disabled={disabled}
              href={`${coinTypeExplorers[commonCoinTypes.CKB]}${
                props.grant.snapshots[commonCoinTypes.CKB]
              }`}
            >
              {formatNumber(
                parseInt(props.grant.snapshots[commonCoinTypes.CKB] || '0', 10),
              )}
            </TextLink>
          </DetailItem>

          <DetailItem title="Arweave TX">
            <TextLink
              underline
              disabled={disabled}
              href={permalink2Explorer(props.grant?.permalink)}
            >
              {props.grant?.permalink.substring(40) || '...'}
            </TextLink>
          </DetailItem>
        </Card>
      ) : null}

      <Card title="How Topic Grant works:">
        <Article small>
          <ul>
            <li>
              Any member can submit a proposal to get grant package during the
              <Tooltip
                text={
                  props.grant && status?.timestamp
                    ? format2Time(
                        status.timestamp.getTime() +
                          props.grant.duration.announcing * 1000,
                        status.timestamp.getTime() +
                          (props.grant.duration.announcing +
                            props.grant.duration.proposing) *
                            1000,
                      )
                    : '...'
                }
                place="top"
                className="inline"
              >
                <span className="text-indigo-600"> proposing </span>
              </Tooltip>
              phase.
            </li>
            {props.grant?.permission.selecting ? (
              <li>
                Only proposals selected by committee members are eligible to be
                voted on.
              </li>
            ) : null}
            <li>
              Any member will vote on the best proposals during the
              <Tooltip
                text={
                  props.grant && status?.timestamp
                    ? format2Time(
                        status.timestamp.getTime() +
                          (props.grant.duration.announcing +
                            props.grant.duration.proposing) *
                            1000,
                        status.timestamp.getTime() +
                          (props.grant.duration.announcing +
                            props.grant.duration.proposing +
                            props.grant.duration.voting) *
                            1000,
                      )
                    : '...'
                }
                place="top"
                className="inline"
              >
                <span className="text-primary-500"> voting </span>
              </Tooltip>
              phase.
            </li>
            <li>
              The top <b>{props.grant?.funding[0]?.[1]}</b> proposal
              {props.grant?.funding[0]?.[1] === 1 ? '' : 's'} will get{' '}
              <b>{props.grant?.funding[0]?.[0]}</b> each at the end.
            </li>
          </ul>
        </Article>
      </Card>
    </div>
  )
}
