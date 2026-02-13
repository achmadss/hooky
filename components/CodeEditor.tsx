'use client'

import Editor, { type BeforeMount } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { useRef, useCallback, useState, useEffect } from 'react'
import type { ContentType } from '@/lib/utils'

interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    contentType: ContentType
    onFormat?: () => void
    minHeight?: string
}

export default function CodeEditor({ value, onChange, contentType, onFormat, minHeight = '200px' }: CodeEditorProps) {
    const { resolvedTheme } = useTheme()
    const editorRef = useRef<Parameters<NonNullable<Parameters<typeof Editor>[0]['onMount']>>[0] | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    const handleBeforeMount: BeforeMount = (monaco) => {
        monaco.editor.defineTheme('hooky-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#18181b',
            },
        })
    }

    const handleMount: Parameters<typeof Editor>[0]['onMount'] = (editor, monaco) => {
        editorRef.current = editor

        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
            onFormat?.()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
            onFormat?.()
        })

        editor.updateOptions({
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
        })
    }

    const handleChange = useCallback((val: string | undefined) => {
        onChange(val ?? '')
    }, [onChange])

    const getLanguage = useCallback(() => {
        switch (contentType) {
            case 'application/json':
                return 'json'
            case 'application/xml':
                return 'xml'
            case 'text/html':
                return 'html'
            default:
                return 'plaintext'
        }
    }, [contentType])

    if (!mounted) {
        return (
            <div
                className="border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden bg-zinc-900"
                style={{ height: minHeight }}
            />
        )
    }

    const editorTheme = resolvedTheme === 'dark' ? 'hooky-dark' : 'vs'

    return (
        <div className="border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden">
            <Editor
                height={minHeight}
                language={getLanguage()}
                value={value}
                onChange={handleChange}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                theme={editorTheme}
                options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontSize: 13,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    padding: { top: 8, bottom: 8 },
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    renderLineHighlight: 'line',
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                    },
                }}
            />
        </div>
    )
}
