import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { tools, Tool } from "@/data/tools"

// Tab represents an open tool
export interface Tab {
  id: string
  toolId: string
  title: string
  state?: Record<string, unknown> // Preserved state for the tool
}

// Panel in split view
export interface Panel {
  id: string
  tabIds: string[]
  activeTabId: string | null
}

// Pipeline node
export interface PipelineNode {
  id: string
  toolId: string
  inputSource: "manual" | "previous" | string // previous node id
  input?: string // For manual input
  output?: string
}

// Pipeline configuration
export interface Pipeline {
  id: string
  name: string
  nodes: PipelineNode[]
  isRunning: boolean
}

// Layout modes
export type LayoutMode = "single" | "split-horizontal" | "split-vertical" | "pipeline"

interface WorkspaceState {
  // Tabs
  tabs: Tab[]
  activeTabId: string | null
  
  // Layout
  layoutMode: LayoutMode
  panels: Panel[]
  
  // Sidebar
  sidebarOpen: boolean
  sidebarWidth: number
  
  // Pipeline
  pipelines: Pipeline[]
  activePipelineId: string | null
  
  // Tool states (preserved when switching tabs)
  toolStates: Record<string, Record<string, unknown>>
}

interface WorkspaceActions {
  // Tab actions
  openTool: (toolId: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  moveTabToPanel: (tabId: string, panelId: string) => void
  
  // Layout actions
  setLayoutMode: (mode: LayoutMode) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  
  // Tool state
  setToolState: (tabId: string, state: Record<string, unknown>) => void
  getToolState: (tabId: string) => Record<string, unknown> | undefined
  
  // Pipeline actions
  createPipeline: (name: string) => string
  addToPipeline: (pipelineId: string, toolId: string) => void
  removeFromPipeline: (pipelineId: string, nodeId: string) => void
  runPipeline: (pipelineId: string, initialInput: string) => Promise<void>
  setActivePipeline: (pipelineId: string | null) => void
  deletePipeline: (pipelineId: string) => void
  
  // Simplified pipeline interface for PipelineBuilder
  activePipeline: Pipeline
  addPipelineNode: (toolId: string) => void
  removePipelineNode: (nodeId: string) => void
  updatePipelineNode: (nodeId: string, updates: Partial<PipelineNode>) => void
  movePipelineNode: (fromIndex: number, toIndex: number) => void
  clearPipeline: () => void
  
  // Utilities
  getToolById: (toolId: string) => Tool | undefined
  getTabById: (tabId: string) => Tab | undefined
}

type WorkspaceContextType = WorkspaceState & WorkspaceActions

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("single")
  const [panels, setPanels] = useState<Panel[]>([
    { id: "main", tabIds: [], activeTabId: null }
  ])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null)
  const [toolStates, setToolStates] = useState<Record<string, Record<string, unknown>>>({})

  const getToolById = useCallback((toolId: string) => {
    return tools.find(t => t.id === toolId)
  }, [])

  const getTabById = useCallback((tabId: string) => {
    return tabs.find(t => t.id === tabId)
  }, [tabs])

  const openTool = useCallback((toolId: string) => {
    const tool = getToolById(toolId)
    if (!tool) return

    // Check if tool is already open
    const existingTab = tabs.find(t => t.toolId === toolId)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    const newTab: Tab = {
      id: generateId(),
      toolId,
      title: tool.title
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)

    // Add to first panel
    setPanels(prev => {
      const newPanels = [...prev]
      if (newPanels[0]) {
        newPanels[0] = {
          ...newPanels[0],
          tabIds: [...newPanels[0].tabIds, newTab.id],
          activeTabId: newTab.id
        }
      }
      return newPanels
    })
  }, [tabs, getToolById])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId))
    
    // Update panels
    setPanels(prev => prev.map(panel => ({
      ...panel,
      tabIds: panel.tabIds.filter(id => id !== tabId),
      activeTabId: panel.activeTabId === tabId 
        ? panel.tabIds.find(id => id !== tabId) || null 
        : panel.activeTabId
    })))

    // Update active tab
    if (activeTabId === tabId) {
      setActiveTabId(prev => {
        const remaining = tabs.filter(t => t.id !== tabId)
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null
      })
    }

    // Clean up tool state
    setToolStates(prev => {
      const next = { ...prev }
      delete next[tabId]
      return next
    })
  }, [activeTabId, tabs])

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
    // Update panel active tab
    setPanels(prev => prev.map(panel => 
      panel.tabIds.includes(tabId)
        ? { ...panel, activeTabId: tabId }
        : panel
    ))
  }, [])

  const moveTabToPanel = useCallback((tabId: string, panelId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId) {
        if (!panel.tabIds.includes(tabId)) {
          return {
            ...panel,
            tabIds: [...panel.tabIds, tabId],
            activeTabId: tabId
          }
        }
      } else {
        return {
          ...panel,
          tabIds: panel.tabIds.filter(id => id !== tabId),
          activeTabId: panel.activeTabId === tabId ? panel.tabIds[0] || null : panel.activeTabId
        }
      }
      return panel
    }))
  }, [])

  const handleSetLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode)
    
    // Setup panels for new mode
    if (mode === "single") {
      setPanels([{ id: "main", tabIds: tabs.map(t => t.id), activeTabId }])
    } else if (mode === "split-horizontal" || mode === "split-vertical") {
      setPanels(prev => {
        if (prev.length === 1) {
          const allTabs = prev[0].tabIds
          const half = Math.ceil(allTabs.length / 2)
          return [
            { id: "left", tabIds: allTabs.slice(0, half), activeTabId: allTabs[0] || null },
            { id: "right", tabIds: allTabs.slice(half), activeTabId: allTabs[half] || null }
          ]
        }
        return prev
      })
    }
  }, [tabs, activeTabId])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const setToolState = useCallback((tabId: string, state: Record<string, unknown>) => {
    setToolStates(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], ...state }
    }))
  }, [])

  const getToolState = useCallback((tabId: string) => {
    return toolStates[tabId]
  }, [toolStates])

  // Pipeline actions
  const createPipeline = useCallback((name: string): string => {
    const id = generateId()
    const newPipeline: Pipeline = {
      id,
      name,
      nodes: [],
      isRunning: false
    }
    setPipelines(prev => [...prev, newPipeline])
    setActivePipelineId(id)
    return id
  }, [])

  const addToPipeline = useCallback((pipelineId: string, toolId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        const newNode: PipelineNode = {
          id: generateId(),
          toolId,
          inputSource: pipeline.nodes.length === 0 ? "manual" : "previous"
        }
        return {
          ...pipeline,
          nodes: [...pipeline.nodes, newNode]
        }
      }
      return pipeline
    }))
  }, [])

  const removeFromPipeline = useCallback((pipelineId: string, nodeId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          nodes: pipeline.nodes.filter(n => n.id !== nodeId)
        }
      }
      return pipeline
    }))
  }, [])

  const runPipeline = useCallback(async (pipelineId: string, initialInput: string) => {
    // Pipeline execution will be handled by the pipeline runner
    // This is a placeholder for the actual implementation
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId ? { ...p, isRunning: true } : p
    ))
    
    // Execution logic will be in the PipelineRunner component
    
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId ? { ...p, isRunning: false } : p
    ))
  }, [])

  const deletePipeline = useCallback((pipelineId: string) => {
    setPipelines(prev => prev.filter(p => p.id !== pipelineId))
    if (activePipelineId === pipelineId) {
      setActivePipelineId(null)
    }
  }, [activePipelineId])

  // Simplified pipeline interface for PipelineBuilder
  const defaultPipeline: Pipeline = { id: "default", name: "Default Pipeline", nodes: [], isRunning: false }
  
  const activePipeline = pipelines.find(p => p.id === activePipelineId) ?? (() => {
    // Auto-create default pipeline if none exists
    if (pipelines.length === 0) {
      const newPipeline = { id: "default", name: "My Pipeline", nodes: [], isRunning: false }
      setPipelines([newPipeline])
      setActivePipelineId("default")
      return newPipeline
    }
    return pipelines[0] ?? defaultPipeline
  })()

  const addPipelineNode = useCallback((toolId: string) => {
    const pipelineId = activePipelineId ?? "default"
    setPipelines(prev => {
      const hasPipeline = prev.some(p => p.id === pipelineId)
      if (!hasPipeline) {
        // Create default pipeline first
        prev = [{ id: "default", name: "My Pipeline", nodes: [], isRunning: false }]
        setActivePipelineId("default")
      }
      return prev.map(pipeline => {
        if (pipeline.id === pipelineId) {
          const newNode: PipelineNode = {
            id: generateId(),
            toolId,
            inputSource: pipeline.nodes.length === 0 ? "manual" : "previous"
          }
          return {
            ...pipeline,
            nodes: [...pipeline.nodes, newNode]
          }
        }
        return pipeline
      })
    })
  }, [activePipelineId])

  const removePipelineNode = useCallback((nodeId: string) => {
    const pipelineId = activePipelineId ?? "default"
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          nodes: pipeline.nodes.filter(n => n.id !== nodeId)
        }
      }
      return pipeline
    }))
  }, [activePipelineId])

  const updatePipelineNode = useCallback((nodeId: string, updates: Partial<PipelineNode>) => {
    const pipelineId = activePipelineId ?? "default"
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          nodes: pipeline.nodes.map(node => 
            node.id === nodeId ? { ...node, ...updates } : node
          )
        }
      }
      return pipeline
    }))
  }, [activePipelineId])

  const movePipelineNode = useCallback((fromIndex: number, toIndex: number) => {
    const pipelineId = activePipelineId ?? "default"
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        const nodes = [...pipeline.nodes]
        if (fromIndex < 0 || fromIndex >= nodes.length || toIndex < 0 || toIndex >= nodes.length) {
          return pipeline
        }
        const [moved] = nodes.splice(fromIndex, 1)
        nodes.splice(toIndex, 0, moved)
        return { ...pipeline, nodes }
      }
      return pipeline
    }))
  }, [activePipelineId])

  const clearPipeline = useCallback(() => {
    const pipelineId = activePipelineId ?? "default"
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          nodes: []
        }
      }
      return pipeline
    }))
  }, [activePipelineId])

  const value: WorkspaceContextType = {
    tabs,
    activeTabId,
    layoutMode,
    panels,
    sidebarOpen,
    sidebarWidth,
    pipelines,
    activePipelineId,
    toolStates,
    openTool,
    closeTab,
    setActiveTab,
    moveTabToPanel,
    setLayoutMode: handleSetLayoutMode,
    toggleSidebar,
    setSidebarWidth,
    setToolState,
    getToolState,
    createPipeline,
    addToPipeline,
    removeFromPipeline,
    runPipeline,
    setActivePipeline: setActivePipelineId,
    deletePipeline,
    activePipeline,
    addPipelineNode,
    removePipelineNode,
    updatePipelineNode,
    movePipelineNode,
    clearPipeline,
    getToolById,
    getTabById
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
