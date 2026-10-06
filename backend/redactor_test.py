from srg.redactor import redact

policy = "For support contact support@gmail.com."

print(redact(
    "Contact support@gmail.com for help.",
    policy
))

print(redact(
    "Contact john@gmail.com for help.",
    policy
))