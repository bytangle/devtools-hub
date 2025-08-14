import { useState } from "react"
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TreeNode {
  id: string
  label: string
  type: 'object' | 'array' | 'property' | 'value' | 'tag' | 'attribute' | 'text' | 'rule' | 'selector' | 'declaration'
  children?: TreeNode[]
  value?: any
  expanded?: boolean
}

interface TreeViewProps {
  data: TreeNode[]
  onNodeClick?: (node: TreeNode) => void
  className?: string
}

interface TreeNodeProps {
  node: TreeNode
  level: number
  onNodeClick?: (node: TreeNode) => void
  onToggle: (nodeId: string) => void
}

function TreeNodeComponent({ node, level, onNodeClick, onToggle }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = node.expanded

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggle(node.id)
    }
  }

  const handleClick = () => {
    onNodeClick?.(node)
  }

  const getIcon = () => {
    switch (node.type) {
      case 'object':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
      case 'array':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
      case 'tag':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
      case 'rule':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTextColor = () => {
    switch (node.type) {
      case 'property':
      case 'selector':
        return 'text-blue-600 dark:text-blue-400'
      case 'value':
      case 'declaration':
        return 'text-green-600 dark:text-green-400'
      case 'attribute':
        return 'text-purple-600 dark:text-purple-400'
      case 'text':
        return 'text-gray-600 dark:text-gray-400'
      case 'tag':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-foreground'
    }
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer transition-colors",
          getTextColor()
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        <div
          className="flex items-center justify-center w-4 h-4"
          onClick={handleToggle}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          )}
        </div>
        
        {getIcon()}
        
        <span className="text-sm font-mono">
          {node.label}
        </span>
        
        {node.value !== undefined && (
          <span className="text-xs text-muted-foreground ml-2">
            {typeof node.value === 'string' ? `"${node.value}"` : String(node.value)}
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ data, onNodeClick, className }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const updateNodeExpansion = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      expanded: expandedNodes.has(node.id),
      children: node.children ? updateNodeExpansion(node.children) : undefined
    }))
  }

  const updatedData = updateNodeExpansion(data)

  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-40 text-muted-foreground", className)}>
        <p className="text-sm">No structure to display</p>
      </div>
    )
  }

  return (
    <div className={cn("border rounded-lg bg-background overflow-auto max-h-96", className)}>
      <div className="p-2">
        {updatedData.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            level={0}
            onNodeClick={onNodeClick}
            onToggle={toggleNode}
          />
        ))}
      </div>
    </div>
  )
}