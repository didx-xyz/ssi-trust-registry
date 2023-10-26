import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'
import { EmailClient } from '../email-client'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSubmissionService(
  repository: SubmissionRepository,
  emailClient: EmailClient,
  domain: string,
): Promise<SubmissionService> {
  return {
    getAllSubmissions: partial(getAllSubmissions, repository),
    addSubmission: partial(addSubmission, repository),
    sendInvitation: partial(sendInvitation, repository, emailClient, domain),
  }
}

export interface SubmissionService {
  sendInvitation: (payload: Record<string, unknown>) => Promise<Invitation>
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (payload: Record<string, unknown>) => Promise<Submission>
}

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  getAllInvitations: () => Promise<Invitation[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  findSubmissionByDid: (did: string) => Promise<Submission | null>
  findSubmissionByInvitationId: (id: string) => Promise<Submission | null>
  findInvitationById: (id: string) => Promise<Invitation | null>
}

export const SubmissionDto = z
  .object({
    invitationId: z
      .string()
      .openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    did: z.string().openapi({ example: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3' }),
    logo_url: z.string().openapi({
      example:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    }),
    domain: z.string().openapi({
      example: 'www.absa.africa',
    }),
    role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('SubmissionRequest')

export type SubmissionDto = z.infer<typeof SubmissionDto>
export type Submission = z.infer<typeof Submission>

export const Submission = SubmissionDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SubmissionResponse')

export const InvitationDto = z
  .object({
    emailAddress: z.string().openapi({ example: 'test@example.com' }),
  })
  .openapi('SubmissionInvitationRequest')

export type InvitationDto = z.infer<typeof InvitationDto>
export type Invitation = z.infer<typeof Invitation>

export const Invitation = InvitationDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SubmissionInvitationResponse')

async function getAllSubmissions(repository: SubmissionRepository) {
  return (await repository.getAllSubmissions()).map((s) => ({
    ...s,
    _id: undefined,
  }))
}

async function addSubmission(
  repository: SubmissionRepository,
  payload: Record<string, unknown>,
): Promise<Submission> {
  const submissionDto = SubmissionDto.parse(payload)

  if (!(await repository.findInvitationById(submissionDto.invitationId))) {
    throw new Error('Invitation not found')
  }
  if (
    await repository.findSubmissionByInvitationId(submissionDto.invitationId)
  ) {
    throw new Error('Submission already completed')
  }
  if (await repository.findSubmissionByDid(submissionDto.did)) {
    throw new Error('Submission with the same DID already exists')
  }
  const submission = {
    ...submissionDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addSubmission(submission)
  logger.info(`Submission ${submission.id} has been added`)
  return submission
}

async function sendInvitation(
  repository: SubmissionRepository,
  emailClient: EmailClient,
  domain: string,
  payload: Record<string, unknown>,
) {
  const invitationDto = InvitationDto.parse(payload)
  const invitation = {
    ...invitationDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  const invitationUrl = `${domain}/api/submissions/${invitation.id}`
  await repository.addInvitation(invitation)
  await emailClient.sendMail(
    invitation.emailAddress,
    'Invitation',
    `<div style="display: flex; flex-direction: column; align-items: center">
    <svg
      width="182"
      height="36"
      viewBox="0 0 182 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.0356 0L21.4402 3.0836L25.8456 1.78256L27.575 6.03798L32.1086 6.77718L31.8205 11.3616L35.5843 13.9946L33.3356 18L35.5843 22.0054L31.8205 24.6384L32.1086 29.2228L27.575 29.962L25.8456 34.2174L21.4402 32.9164L18.0356 36L14.6311 32.9164L10.2257 34.2174L8.49625 29.962L3.96268 29.2228L4.25082 24.6384L0.486942 22.0054L2.73564 18L0.486942 13.9946L4.25082 11.3616L3.96268 6.77718L8.49625 6.03798L10.2257 1.78256L14.6311 3.0836L18.0356 0Z"
        fill="#3CB98C"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24.5242 13.9397C25.11 14.5255 25.11 15.4753 24.5242 16.0611L17.5961 22.9891C17.0104 23.5749 16.0606 23.5749 15.4748 22.9891L12.0108 19.5251C11.425 18.9393 11.425 17.9896 12.0108 17.4038C12.5966 16.818 13.5463 16.818 14.1321 17.4038L16.5355 19.8071L22.4029 13.9397C22.9887 13.354 23.9384 13.3539 24.5242 13.9397Z"
        fill="white"
      ></path>
      <path
        d="M55.6235 8.56689V23.4966H52.5576V8.56689H55.6235ZM60.2173 8.56689V10.9766H48.0356V8.56689H60.2173Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M64.0215 14.8218V23.4966H61.0684V12.4019H63.8472L64.0215 14.8218ZM67.3643 12.3301L67.313 15.0679C67.1694 15.0474 66.9951 15.0303 66.79 15.0166C66.5918 14.9961 66.4106 14.9858 66.2466 14.9858C65.8296 14.9858 65.4673 15.0405 65.1597 15.1499C64.8589 15.2524 64.606 15.4062 64.4009 15.6113C64.2026 15.8164 64.0522 16.0659 63.9497 16.3599C63.854 16.6538 63.7993 16.9888 63.7856 17.3647L63.1909 17.1802C63.1909 16.4624 63.2627 15.8027 63.4062 15.2012C63.5498 14.5928 63.7583 14.063 64.0317 13.6118C64.312 13.1606 64.6538 12.812 65.0571 12.5659C65.4604 12.3198 65.9219 12.1968 66.4414 12.1968C66.6055 12.1968 66.7729 12.2104 66.9438 12.2378C67.1147 12.2583 67.2549 12.2891 67.3643 12.3301Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M75.3213 20.8408V12.4019H78.2744V23.4966H75.4956L75.3213 20.8408ZM75.6494 18.5645L76.521 18.5439C76.521 19.2822 76.4355 19.9692 76.2646 20.605C76.0938 21.2339 75.8374 21.7808 75.4956 22.2456C75.1538 22.7036 74.7231 23.0625 74.2036 23.3223C73.6841 23.5752 73.0723 23.7017 72.3682 23.7017C71.8281 23.7017 71.3291 23.6265 70.8711 23.4761C70.4199 23.3188 70.0303 23.0762 69.7021 22.748C69.3809 22.4131 69.1279 21.9858 68.9434 21.4663C68.7656 20.9399 68.6768 20.3076 68.6768 19.5693V12.4019H71.6299V19.5898C71.6299 19.918 71.6675 20.1948 71.7427 20.4204C71.8247 20.646 71.9375 20.8306 72.0811 20.9741C72.2246 21.1177 72.3921 21.2202 72.5835 21.2817C72.7817 21.3433 73.0005 21.374 73.2397 21.374C73.8481 21.374 74.3267 21.251 74.6753 21.0049C75.0308 20.7588 75.2803 20.4238 75.4238 20C75.5742 19.5693 75.6494 19.0908 75.6494 18.5645Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M86.5288 20.4307C86.5288 20.2188 86.4673 20.0273 86.3442 19.8564C86.2212 19.6855 85.9922 19.5283 85.6572 19.3848C85.3291 19.2344 84.854 19.0977 84.2319 18.9746C83.6714 18.8516 83.1484 18.6978 82.6631 18.5132C82.1846 18.3218 81.7676 18.0928 81.4121 17.8262C81.0635 17.5596 80.79 17.2451 80.5918 16.8828C80.3936 16.5137 80.2944 16.0933 80.2944 15.6216C80.2944 15.1567 80.3936 14.7192 80.5918 14.3091C80.7969 13.8989 81.0874 13.5366 81.4634 13.2222C81.8462 12.9009 82.311 12.6514 82.8579 12.4736C83.4116 12.2891 84.0337 12.1968 84.7241 12.1968C85.688 12.1968 86.5151 12.3506 87.2056 12.6582C87.9028 12.9658 88.436 13.3896 88.8052 13.9297C89.1812 14.4629 89.3691 15.0713 89.3691 15.7549H86.416C86.416 15.4678 86.3545 15.2114 86.2314 14.9858C86.1152 14.7534 85.9307 14.5723 85.6777 14.4424C85.4316 14.3057 85.1104 14.2373 84.7139 14.2373C84.3857 14.2373 84.1021 14.2954 83.8628 14.4116C83.6235 14.521 83.439 14.6714 83.3091 14.8628C83.186 15.0474 83.1245 15.2524 83.1245 15.478C83.1245 15.6489 83.1587 15.8027 83.2271 15.9395C83.3022 16.0693 83.4219 16.189 83.5859 16.2983C83.75 16.4077 83.9619 16.5103 84.2217 16.606C84.4883 16.6948 84.8164 16.7769 85.2061 16.8521C86.0059 17.0161 86.7202 17.2314 87.3491 17.498C87.978 17.7578 88.4771 18.1133 88.8462 18.5645C89.2153 19.0088 89.3999 19.5933 89.3999 20.3179C89.3999 20.8101 89.2905 21.2612 89.0718 21.6714C88.853 22.0815 88.5386 22.4404 88.1284 22.748C87.7183 23.0488 87.2261 23.2847 86.6519 23.4556C86.0845 23.6196 85.4453 23.7017 84.7344 23.7017C83.7021 23.7017 82.8271 23.5171 82.1094 23.1479C81.3984 22.7788 80.8584 22.3105 80.4893 21.7432C80.127 21.1689 79.9458 20.5811 79.9458 19.9795H82.7451C82.7588 20.3828 82.8613 20.7075 83.0527 20.9536C83.251 21.1997 83.5005 21.3774 83.8013 21.4868C84.1089 21.5962 84.4404 21.6509 84.7959 21.6509C85.1787 21.6509 85.4966 21.5996 85.7495 21.4971C86.0024 21.3877 86.1938 21.2441 86.3237 21.0664C86.4604 20.8818 86.5288 20.6699 86.5288 20.4307Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M96.752 12.4019V14.4937H90.292V12.4019H96.752ZM91.8916 9.66406H94.8447V20.1538C94.8447 20.4751 94.8857 20.7212 94.9678 20.8921C95.0566 21.063 95.1865 21.1826 95.3574 21.251C95.5283 21.3125 95.7437 21.3433 96.0034 21.3433C96.188 21.3433 96.3521 21.3364 96.4956 21.3228C96.646 21.3022 96.7725 21.2817 96.875 21.2612L96.8853 23.4351C96.6323 23.5171 96.3589 23.582 96.0649 23.6299C95.771 23.6777 95.4463 23.7017 95.0908 23.7017C94.4414 23.7017 93.874 23.5957 93.3887 23.3838C92.9102 23.165 92.541 22.8164 92.2812 22.3379C92.0215 21.8594 91.8916 21.2305 91.8916 20.4512V9.66406Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M103.848 8.56689H109.416C110.557 8.56689 111.538 8.73779 112.358 9.07959C113.186 9.42139 113.821 9.92725 114.266 10.5972C114.71 11.2671 114.932 12.0908 114.932 13.0684C114.932 13.8682 114.795 14.5552 114.522 15.1294C114.255 15.6968 113.876 16.1719 113.384 16.5547C112.898 16.9307 112.328 17.2314 111.671 17.457L110.697 17.9697H105.857L105.837 15.5703H109.436C109.976 15.5703 110.424 15.4746 110.779 15.2832C111.135 15.0918 111.401 14.8252 111.579 14.4834C111.764 14.1416 111.856 13.7451 111.856 13.2939C111.856 12.8154 111.767 12.4019 111.589 12.0532C111.412 11.7046 111.142 11.438 110.779 11.2534C110.417 11.0688 109.962 10.9766 109.416 10.9766H106.924V23.4966H103.848V8.56689ZM112.194 23.4966L108.79 16.8418L112.041 16.8213L115.486 23.353V23.4966H112.194Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M122.223 23.7017C121.361 23.7017 120.589 23.5649 119.905 23.2915C119.222 23.0112 118.641 22.625 118.162 22.1328C117.69 21.6406 117.328 21.0698 117.075 20.4204C116.822 19.7642 116.696 19.0669 116.696 18.3286V17.9185C116.696 17.0776 116.815 16.3086 117.055 15.6113C117.294 14.9141 117.636 14.3091 118.08 13.7964C118.531 13.2837 119.078 12.8906 119.721 12.6172C120.363 12.3369 121.088 12.1968 121.895 12.1968C122.681 12.1968 123.378 12.3267 123.986 12.5864C124.595 12.8462 125.104 13.2153 125.514 13.6938C125.931 14.1724 126.246 14.7466 126.458 15.4165C126.669 16.0796 126.775 16.8179 126.775 17.6313V18.8618H117.957V16.8931H123.874V16.6675C123.874 16.2573 123.798 15.8916 123.648 15.5703C123.504 15.2422 123.286 14.9824 122.992 14.791C122.698 14.5996 122.322 14.5039 121.864 14.5039C121.474 14.5039 121.139 14.5894 120.859 14.7603C120.579 14.9312 120.35 15.1704 120.172 15.478C120.001 15.7856 119.871 16.1479 119.782 16.5649C119.7 16.9751 119.659 17.4263 119.659 17.9185V18.3286C119.659 18.7729 119.721 19.1831 119.844 19.5591C119.974 19.9351 120.155 20.2598 120.387 20.5332C120.626 20.8066 120.914 21.0186 121.249 21.1689C121.59 21.3193 121.977 21.3945 122.407 21.3945C122.94 21.3945 123.436 21.292 123.894 21.0869C124.359 20.875 124.759 20.5571 125.094 20.1333L126.529 21.6919C126.297 22.0269 125.979 22.3481 125.576 22.6558C125.179 22.9634 124.701 23.2163 124.14 23.4146C123.58 23.606 122.94 23.7017 122.223 23.7017Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M135.481 12.4019H138.157V23.1274C138.157 24.1392 137.932 24.9971 137.48 25.7012C137.036 26.4121 136.414 26.9487 135.614 27.311C134.814 27.6802 133.885 27.8647 132.825 27.8647C132.36 27.8647 131.868 27.8032 131.349 27.6802C130.836 27.5571 130.344 27.3657 129.872 27.106C129.407 26.8462 129.018 26.5181 128.703 26.1216L130.005 24.3784C130.347 24.7749 130.744 25.0825 131.195 25.3013C131.646 25.5269 132.145 25.6396 132.692 25.6396C133.225 25.6396 133.676 25.5405 134.045 25.3423C134.415 25.1509 134.698 24.8672 134.896 24.4912C135.095 24.1221 135.194 23.6743 135.194 23.1479V14.9653L135.481 12.4019ZM128.016 18.0825V17.8672C128.016 17.0195 128.119 16.2505 128.324 15.5601C128.536 14.8628 128.833 14.2646 129.216 13.7656C129.605 13.2666 130.077 12.8804 130.631 12.6069C131.185 12.3335 131.81 12.1968 132.507 12.1968C133.246 12.1968 133.864 12.3335 134.363 12.6069C134.862 12.8804 135.272 13.27 135.594 13.7759C135.915 14.2749 136.165 14.8662 136.342 15.5498C136.527 16.2266 136.67 16.9683 136.773 17.7749V18.2466C136.67 19.019 136.517 19.7368 136.312 20.3999C136.106 21.063 135.836 21.644 135.501 22.1431C135.167 22.6353 134.75 23.0181 134.25 23.2915C133.758 23.5649 133.17 23.7017 132.487 23.7017C131.803 23.7017 131.185 23.5615 130.631 23.2812C130.084 23.001 129.616 22.6079 129.226 22.1021C128.836 21.5962 128.536 21.0015 128.324 20.3179C128.119 19.6343 128.016 18.8892 128.016 18.0825ZM130.969 17.8672V18.0825C130.969 18.5405 131.014 18.9678 131.103 19.3643C131.191 19.7607 131.328 20.1128 131.513 20.4204C131.704 20.7212 131.94 20.957 132.22 21.1279C132.507 21.292 132.846 21.374 133.235 21.374C133.775 21.374 134.216 21.2612 134.558 21.0356C134.9 20.8032 135.156 20.4854 135.327 20.082C135.498 19.6787 135.597 19.2139 135.625 18.6875V17.3442C135.611 16.9136 135.553 16.5273 135.45 16.1855C135.348 15.8369 135.204 15.5396 135.02 15.2935C134.835 15.0474 134.596 14.856 134.302 14.7192C134.008 14.5825 133.659 14.5142 133.256 14.5142C132.866 14.5142 132.528 14.603 132.241 14.7808C131.96 14.9517 131.725 15.1875 131.533 15.4883C131.349 15.7891 131.208 16.1445 131.113 16.5547C131.017 16.958 130.969 17.3955 130.969 17.8672Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M143.571 12.4019V23.4966H140.608V12.4019H143.571ZM140.423 9.51025C140.423 9.07959 140.574 8.72412 140.875 8.44385C141.175 8.16357 141.579 8.02344 142.084 8.02344C142.583 8.02344 142.983 8.16357 143.284 8.44385C143.592 8.72412 143.746 9.07959 143.746 9.51025C143.746 9.94092 143.592 10.2964 143.284 10.5767C142.983 10.8569 142.583 10.9971 142.084 10.9971C141.579 10.9971 141.175 10.8569 140.875 10.5767C140.574 10.2964 140.423 9.94092 140.423 9.51025Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M152.01 20.4307C152.01 20.2188 151.949 20.0273 151.826 19.8564C151.703 19.6855 151.474 19.5283 151.139 19.3848C150.811 19.2344 150.335 19.0977 149.713 18.9746C149.153 18.8516 148.63 18.6978 148.145 18.5132C147.666 18.3218 147.249 18.0928 146.894 17.8262C146.545 17.5596 146.271 17.2451 146.073 16.8828C145.875 16.5137 145.776 16.0933 145.776 15.6216C145.776 15.1567 145.875 14.7192 146.073 14.3091C146.278 13.8989 146.569 13.5366 146.945 13.2222C147.328 12.9009 147.792 12.6514 148.339 12.4736C148.893 12.2891 149.515 12.1968 150.206 12.1968C151.169 12.1968 151.997 12.3506 152.687 12.6582C153.384 12.9658 153.917 13.3896 154.287 13.9297C154.663 14.4629 154.851 15.0713 154.851 15.7549H151.897C151.897 15.4678 151.836 15.2114 151.713 14.9858C151.597 14.7534 151.412 14.5723 151.159 14.4424C150.913 14.3057 150.592 14.2373 150.195 14.2373C149.867 14.2373 149.583 14.2954 149.344 14.4116C149.105 14.521 148.92 14.6714 148.791 14.8628C148.667 15.0474 148.606 15.2524 148.606 15.478C148.606 15.6489 148.64 15.8027 148.708 15.9395C148.784 16.0693 148.903 16.189 149.067 16.2983C149.231 16.4077 149.443 16.5103 149.703 16.606C149.97 16.6948 150.298 16.7769 150.688 16.8521C151.487 17.0161 152.202 17.2314 152.831 17.498C153.459 17.7578 153.958 18.1133 154.328 18.5645C154.697 19.0088 154.881 19.5933 154.881 20.3179C154.881 20.8101 154.772 21.2612 154.553 21.6714C154.334 22.0815 154.02 22.4404 153.61 22.748C153.2 23.0488 152.708 23.2847 152.133 23.4556C151.566 23.6196 150.927 23.7017 150.216 23.7017C149.184 23.7017 148.309 23.5171 147.591 23.1479C146.88 22.7788 146.34 22.3105 145.971 21.7432C145.608 21.1689 145.427 20.5811 145.427 19.9795H148.227C148.24 20.3828 148.343 20.7075 148.534 20.9536C148.732 21.1997 148.982 21.3774 149.283 21.4868C149.59 21.5962 149.922 21.6509 150.277 21.6509C150.66 21.6509 150.978 21.5996 151.231 21.4971C151.484 21.3877 151.675 21.2441 151.805 21.0664C151.942 20.8818 152.01 20.6699 152.01 20.4307Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M162.233 12.4019V14.4937H155.773V12.4019H162.233ZM157.373 9.66406H160.326V20.1538C160.326 20.4751 160.367 20.7212 160.449 20.8921C160.538 21.063 160.668 21.1826 160.839 21.251C161.01 21.3125 161.225 21.3433 161.485 21.3433C161.669 21.3433 161.833 21.3364 161.977 21.3228C162.127 21.3022 162.254 21.2817 162.356 21.2612L162.367 23.4351C162.114 23.5171 161.84 23.582 161.546 23.6299C161.252 23.6777 160.928 23.7017 160.572 23.7017C159.923 23.7017 159.355 23.5957 158.87 23.3838C158.392 23.165 158.022 22.8164 157.763 22.3379C157.503 21.8594 157.373 21.2305 157.373 20.4512V9.66406Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M166.868 14.8218V23.4966H163.915V12.4019H166.694L166.868 14.8218ZM170.211 12.3301L170.16 15.0679C170.016 15.0474 169.842 15.0303 169.637 15.0166C169.438 14.9961 169.257 14.9858 169.093 14.9858C168.676 14.9858 168.314 15.0405 168.006 15.1499C167.706 15.2524 167.453 15.4062 167.248 15.6113C167.049 15.8164 166.899 16.0659 166.796 16.3599C166.701 16.6538 166.646 16.9888 166.632 17.3647L166.038 17.1802C166.038 16.4624 166.109 15.8027 166.253 15.2012C166.396 14.5928 166.605 14.063 166.878 13.6118C167.159 13.1606 167.5 12.812 167.904 12.5659C168.307 12.3198 168.769 12.1968 169.288 12.1968C169.452 12.1968 169.62 12.2104 169.791 12.2378C169.961 12.2583 170.102 12.2891 170.211 12.3301Z"
        fill="#2D3E47"
      ></path>
      <path
        d="M175.082 22.2456L178.024 12.4019H181.193L176.732 25.168C176.637 25.4482 176.507 25.749 176.343 26.0703C176.186 26.3916 175.97 26.6958 175.697 26.9829C175.43 27.2769 175.092 27.5161 174.682 27.7007C174.278 27.8853 173.783 27.9775 173.195 27.9775C172.915 27.9775 172.686 27.9604 172.508 27.9263C172.33 27.8921 172.118 27.8442 171.872 27.7827V25.6191C171.947 25.6191 172.026 25.6191 172.108 25.6191C172.19 25.626 172.269 25.6294 172.344 25.6294C172.733 25.6294 173.051 25.585 173.297 25.4961C173.543 25.4072 173.742 25.2705 173.892 25.0859C174.042 24.9082 174.162 24.6758 174.251 24.3887L175.082 22.2456ZM173.851 12.4019L176.261 20.4409L176.681 23.5684L174.671 23.7837L170.683 12.4019H173.851Z"
        fill="#2D3E47"
      ></path>
    </svg>
    <h1 style="text-align: center">
      You have been invited to the <br />Trust Registry by ABSA
    </h1>
    <h2 style="font-weight: 400; text-align: center">
      Click the button below to open the submission page
    </h2>
    <a
      style="
        background-color: rgb(255, 124, 31);
        padding: 20px 16px;
        color: rgb(255, 255, 255);
        border-radius: 12px;
        border-width: 0.3px;
        border-color: rgb(255, 255, 255);
        font-size: 16px;
        font-weight: 700;
        text-decoration: none;
      "
      >Open submission page</a
    >
    <h3 style={{fontWeight:'400', textAlign:'center'}}>Or send a POST request to the API endpoint below:</h3>
    <p>${invitationUrl}</p>
  </div>
  `,
  )
  return invitation
}
