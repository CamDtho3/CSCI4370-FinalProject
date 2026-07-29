/** Mirrors the ErrorResponse shape GlobalExceptionHandler returns. */
export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null)
  throw new ApiError(
    response.status,
    body?.code ?? 'UNKNOWN_ERROR',
    body?.message ?? 'Something went wrong.',
  )
}
