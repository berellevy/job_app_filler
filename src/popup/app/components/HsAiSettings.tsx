import React, { FC, FormEvent, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { AutoFixHighIcon, ArrowRightIcon } from '@src/shared/utils/icons'
import { DEFAULT_AI_ANSWER_CONFIG } from '@src/shared/utils/ai/types'
import { HS_ACCENT } from '../../hsTheme'
import { useAiConfig } from '../hooks/useAiConfig'

type SaveState = 'idle' | 'saved'

/**
 * Popup section that lets the user configure the AI open-text answer feature.
 * The config is persisted to `chrome.storage.local` (via {@link useAiConfig}).
 * The API key is held only in component state and storage — never logged.
 */
export const HsAiSettings: FC = () => {
  const { config, loading, error: storageError, save } = useAiConfig()

  const [expanded, setExpanded] = useState<boolean>(false)
  const [enabled, setEnabled] = useState<boolean>(DEFAULT_AI_ANSWER_CONFIG.enabled)
  const [apiKey, setApiKey] = useState<string>('')
  const [baseUrl, setBaseUrl] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [hydrated, setHydrated] = useState<boolean>(false)

  // Hydrate local fields once the stored config has loaded.
  if (!hydrated && !loading) {
    setEnabled(config.enabled)
    setApiKey(config.apiKey)
    setBaseUrl(config.baseUrl === DEFAULT_AI_ANSWER_CONFIG.baseUrl ? '' : config.baseUrl)
    setModel(config.model === DEFAULT_AI_ANSWER_CONFIG.model ? '' : config.model)
    setHydrated(true)
  }

  const onSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    setSaveState('idle')
    const next = {
      ...config,
      enabled,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || DEFAULT_AI_ANSWER_CONFIG.baseUrl,
      model: model.trim() || DEFAULT_AI_ANSWER_CONFIG.model,
    }
    const ok = await save(next)
    setSaving(false)
    if (ok) {
      setSaveState('saved')
    }
  }

  return (
    <Box
      component="section"
      aria-labelledby="hs-ai-heading"
      sx={{ px: 2, py: 2, borderTop: '1px solid #E2E8F0' }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoFixHighIcon sx={{ fontSize: 18, color: HS_ACCENT }} />
          <Typography
            id="hs-ai-heading"
            variant="subtitle2"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            AI open-text answers
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls="hs-ai-config"
          aria-label={
            expanded ? 'Collapse AI settings' : 'Expand AI settings'
          }
        >
          <ArrowRightIcon
            sx={{
              transition: 'transform 150ms ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        </IconButton>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          id="hs-ai-config"
          component="form"
          onSubmit={onSave}
          noValidate
          sx={{ mt: 1.5 }}
        >
          <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
            Generate answers to open-text questions with an OpenAI-compatible
            API. Your key is stored locally in this browser only.
          </Typography>
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => {
                    setEnabled(e.target.checked)
                    setSaveState('idle')
                  }}
                  disabled={saving || loading}
                />
              }
              label="Enable AI answers"
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="API key"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setSaveState('idle')
              }}
              inputProps={{ 'aria-label': 'OpenAI-compatible API key' }}
              disabled={saving || loading}
            />
            <TextField
              fullWidth
              size="small"
              label="Model"
              placeholder={DEFAULT_AI_ANSWER_CONFIG.model}
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                setSaveState('idle')
              }}
              inputProps={{ 'aria-label': 'Model identifier' }}
              disabled={saving || loading}
            />
            <TextField
              fullWidth
              size="small"
              label="Base URL"
              placeholder={DEFAULT_AI_ANSWER_CONFIG.baseUrl}
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value)
                setSaveState('idle')
              }}
              inputProps={{ 'aria-label': 'API base URL' }}
              disabled={saving || loading}
            />
            {storageError ? (
              <Alert severity="error" role="alert" sx={{ py: 0 }}>
                {storageError}
              </Alert>
            ) : null}
            {saveState === 'saved' ? (
              <Alert severity="success" role="status" sx={{ py: 0 }}>
                Settings saved.
              </Alert>
            ) : null}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={saving || loading}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  )
}
