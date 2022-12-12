import type { SafeParseError, SafeParseReturnType, ZodError } from "zod";

export const zodErrorMessagesMap = <T>(error: SafeParseError<T>) => {

  if (!error.success) {
    const formatErrors = error.error.format()

    const errorsMap = new Map(Object.entries(formatErrors))

    const newErrorMap = new Map()

    for (const [key, value] of errorsMap.entries()) {
      if (key !== '_errors') {
        newErrorMap.set(key, value._errors.join(", ") || "")
      }
    }

    return newErrorMap

  }

};
