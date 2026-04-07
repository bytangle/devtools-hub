import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Globe, Search, Copy } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StatusCode {
  code: number
  text: string
  description: string
  category: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error'
}

const statusCodes: StatusCode[] = [
  // 1xx Informational
  { code: 100, text: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: 'info' },
  { code: 101, text: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.', category: 'info' },
  { code: 102, text: 'Processing', description: 'The server is processing the request but no response is available yet.', category: 'info' },
  { code: 103, text: 'Early Hints', description: 'Used to return some response headers before final HTTP message.', category: 'info' },
  
  // 2xx Success
  { code: 200, text: 'OK', description: 'The request has succeeded.', category: 'success' },
  { code: 201, text: 'Created', description: 'The request has been fulfilled and resulted in a new resource being created.', category: 'success' },
  { code: 202, text: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.', category: 'success' },
  { code: 203, text: 'Non-Authoritative Information', description: 'The returned meta-information is from a cached copy.', category: 'success' },
  { code: 204, text: 'No Content', description: 'The server successfully processed the request but is not returning any content.', category: 'success' },
  { code: 205, text: 'Reset Content', description: 'The server successfully processed the request and is instructing the client to reset the document view.', category: 'success' },
  { code: 206, text: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.', category: 'success' },
  { code: 207, text: 'Multi-Status', description: 'A Multi-Status response conveys information about multiple resources.', category: 'success' },
  { code: 208, text: 'Already Reported', description: 'Members of a DAV binding have already been enumerated.', category: 'success' },
  { code: 226, text: 'IM Used', description: 'The server has fulfilled a GET request for the resource.', category: 'success' },
  
  // 3xx Redirection
  { code: 300, text: 'Multiple Choices', description: 'The request has more than one possible response.', category: 'redirect' },
  { code: 301, text: 'Moved Permanently', description: 'The requested resource has been assigned a new permanent URI.', category: 'redirect' },
  { code: 302, text: 'Found', description: 'The requested resource resides temporarily under a different URI.', category: 'redirect' },
  { code: 303, text: 'See Other', description: 'The response can be found under a different URI using GET.', category: 'redirect' },
  { code: 304, text: 'Not Modified', description: 'The resource has not been modified since last requested.', category: 'redirect' },
  { code: 305, text: 'Use Proxy', description: 'The requested resource must be accessed through the proxy.', category: 'redirect' },
  { code: 307, text: 'Temporary Redirect', description: 'The request should be repeated with another URI but future requests should still use the original URI.', category: 'redirect' },
  { code: 308, text: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URI.', category: 'redirect' },
  
  // 4xx Client Errors
  { code: 400, text: 'Bad Request', description: 'The server cannot process the request due to client error.', category: 'client-error' },
  { code: 401, text: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.', category: 'client-error' },
  { code: 402, text: 'Payment Required', description: 'Reserved for future use. Originally intended for digital payment systems.', category: 'client-error' },
  { code: 403, text: 'Forbidden', description: 'The server understood the request but refuses to authorize it.', category: 'client-error' },
  { code: 404, text: 'Not Found', description: 'The requested resource could not be found on the server.', category: 'client-error' },
  { code: 405, text: 'Method Not Allowed', description: 'The request method is not supported for the requested resource.', category: 'client-error' },
  { code: 406, text: 'Not Acceptable', description: 'The requested resource is only capable of generating content not acceptable.', category: 'client-error' },
  { code: 407, text: 'Proxy Authentication Required', description: 'The client must first authenticate itself with the proxy.', category: 'client-error' },
  { code: 408, text: 'Request Timeout', description: 'The server timed out waiting for the request.', category: 'client-error' },
  { code: 409, text: 'Conflict', description: 'The request could not be completed due to a conflict with the current state.', category: 'client-error' },
  { code: 410, text: 'Gone', description: 'The resource requested is no longer available and will not be available again.', category: 'client-error' },
  { code: 411, text: 'Length Required', description: 'The request did not specify the length of its content.', category: 'client-error' },
  { code: 412, text: 'Precondition Failed', description: 'The server does not meet one of the preconditions specified.', category: 'client-error' },
  { code: 413, text: 'Payload Too Large', description: 'The request is larger than the server is willing or able to process.', category: 'client-error' },
  { code: 414, text: 'URI Too Long', description: 'The URI provided was too long for the server to process.', category: 'client-error' },
  { code: 415, text: 'Unsupported Media Type', description: 'The request entity has a media type which the server does not support.', category: 'client-error' },
  { code: 416, text: 'Range Not Satisfiable', description: 'The client has asked for a portion of the file but the server cannot supply it.', category: 'client-error' },
  { code: 417, text: 'Expectation Failed', description: 'The server cannot meet the requirements of the Expect request-header field.', category: 'client-error' },
  { code: 418, text: "I'm a Teapot", description: 'The server refuses to brew coffee because it is a teapot. (RFC 2324)', category: 'client-error' },
  { code: 421, text: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.', category: 'client-error' },
  { code: 422, text: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.', category: 'client-error' },
  { code: 423, text: 'Locked', description: 'The resource that is being accessed is locked.', category: 'client-error' },
  { code: 424, text: 'Failed Dependency', description: 'The request failed due to failure of a previous request.', category: 'client-error' },
  { code: 425, text: 'Too Early', description: 'The server is unwilling to risk processing a request that might be replayed.', category: 'client-error' },
  { code: 426, text: 'Upgrade Required', description: 'The client should switch to a different protocol.', category: 'client-error' },
  { code: 428, text: 'Precondition Required', description: 'The origin server requires the request to be conditional.', category: 'client-error' },
  { code: 429, text: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.', category: 'client-error' },
  { code: 431, text: 'Request Header Fields Too Large', description: 'The server is unwilling to process the request because header fields are too large.', category: 'client-error' },
  { code: 451, text: 'Unavailable For Legal Reasons', description: 'The resource is unavailable due to legal demands.', category: 'client-error' },
  
  // 5xx Server Errors
  { code: 500, text: 'Internal Server Error', description: 'The server has encountered a situation it does not know how to handle.', category: 'server-error' },
  { code: 501, text: 'Not Implemented', description: 'The request method is not supported by the server.', category: 'server-error' },
  { code: 502, text: 'Bad Gateway', description: 'The server received an invalid response from the upstream server.', category: 'server-error' },
  { code: 503, text: 'Service Unavailable', description: 'The server is not ready to handle the request.', category: 'server-error' },
  { code: 504, text: 'Gateway Timeout', description: 'The server is acting as a gateway and cannot get a response in time.', category: 'server-error' },
  { code: 505, text: 'HTTP Version Not Supported', description: 'The HTTP version used in the request is not supported.', category: 'server-error' },
  { code: 506, text: 'Variant Also Negotiates', description: 'Transparent content negotiation results in a circular reference.', category: 'server-error' },
  { code: 507, text: 'Insufficient Storage', description: 'The server is unable to store the representation needed.', category: 'server-error' },
  { code: 508, text: 'Loop Detected', description: 'The server detected an infinite loop while processing the request.', category: 'server-error' },
  { code: 510, text: 'Not Extended', description: 'Further extensions to the request are required.', category: 'server-error' },
  { code: 511, text: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access.', category: 'server-error' },
]

const categoryColors: Record<StatusCode['category'], string> = {
  'info': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'success': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'redirect': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'client-error': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'server-error': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const categoryLabels: Record<StatusCode['category'], string> = {
  'info': '1xx Informational',
  'success': '2xx Success',
  'redirect': '3xx Redirection',
  'client-error': '4xx Client Error',
  'server-error': '5xx Server Error',
}

export function HttpStatusTool({ tabId }: ToolComponentProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<StatusCode['category'] | 'all'>('all')

  const filteredCodes = useMemo(() => {
    return statusCodes.filter(sc => {
      const matchesSearch = search === '' || 
        sc.code.toString().includes(search) ||
        sc.text.toLowerCase().includes(search.toLowerCase()) ||
        sc.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || sc.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory])

  const groupedCodes = useMemo(() => {
    const groups: Record<StatusCode['category'], StatusCode[]> = {
      'info': [],
      'success': [],
      'redirect': [],
      'client-error': [],
      'server-error': [],
    }
    filteredCodes.forEach(sc => groups[sc.category].push(sc))
    return groups
  }, [filteredCodes])

  const copyCode = async (code: StatusCode) => {
    await navigator.clipboard.writeText(`${code.code} ${code.text}`)
    toast({ title: `Copied ${code.code} ${code.text}` })
  }

  return (
    <ToolShell
      icon={Globe}
      title="HTTP Status Codes"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or description..."
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {Object.entries(categoryLabels).map(([cat, label]) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat as StatusCode['category'])}
          >
            {label}
          </Button>
        ))}
      </div>
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {Object.entries(groupedCodes).map(([category, codes]) => {
            if (codes.length === 0) return null
            return (
              <div key={category} className="rounded-lg border p-4">
                <h3 className={`text-sm font-medium mb-3 ${categoryColors[category as StatusCode['category']]?.split(' ')[1]}`}>
                  {categoryLabels[category as StatusCode['category']]}
                </h3>
                <div className="space-y-2">
                  {codes.map(sc => (
                    <div
                      key={sc.code}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors group"
                    >
                      <Badge className={`${categoryColors[sc.category]} font-mono min-w-[3rem] justify-center`}>
                        {sc.code}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sc.text}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() => copyCode(sc)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{sc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </ToolShell>
  )
}
