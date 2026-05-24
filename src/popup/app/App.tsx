import React, { FC, useCallback } from 'react'
import './popup.css'
import { Box, ThemeProvider } from '@mui/material'

import { hsTheme } from '../hsTheme'
import { HsHeader } from './components/HsHeader'
import { HsAuthSection } from './components/HsAuthSection'
import {
  HsCurrentPageSection,
  isSupportedAtsUrl,
} from './components/HsCurrentPageSection'
import { HsFooter } from './components/HsFooter'
import { ProfileSwitcher } from './ProfileSwitcher'
import { useActiveTab } from './hooks/useActiveTab'
import { useHsAuth } from './hooks/useHsAuth'
import { useHsMatch } from './hooks/useHsMatch'

const resolveExtensionVersion = (): string => {
  try {
    return chrome.runtime?.getManifest?.()?.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

const EXTENSION_VERSION = resolveExtensionVersion()

export const App: FC = () => {
  const { tab, refresh: refreshTab } = useActiveTab()
  const auth = useHsAuth()
  const supported = isSupportedAtsUrl(tab.url)

  const match = useHsMatch(tab.url, auth.hasPat && supported)

  const refreshAll = useCallback(() => {
    refreshTab()
    auth.refresh()
    match.refresh()
  }, [refreshTab, auth, match])

  const onOpenForm = useCallback(() => {
    if (tab.id === null) return
    try {
      chrome.tabs.update(tab.id, { active: true })
      chrome.windows.getCurrent({}, (win) => {
        if (typeof win?.id === 'number') {
          chrome.windows.update(win.id, { focused: true })
        }
        window.close()
      })
    } catch {
      window.close()
    }
  }, [tab.id])

  return (
    <ThemeProvider theme={hsTheme}>
      <Box
        component="main"
        role="main"
        aria-label="HiredSignal Autofill"
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 280 }}
      >
        <HsHeader />
        <HsAuthSection
          hasPat={auth.hasPat}
          candidate={auth.candidate}
          candidateError={auth.candidateError}
          onAuthChanged={refreshAll}
        />
        {auth.hasPat ? (
          <>
            <ProfileSwitcher />
            <HsCurrentPageSection
              match={match.match}
              error={match.error}
              tabUrl={tab.url}
              supported={supported}
              onRefresh={match.refresh}
              onOpenForm={onOpenForm}
            />
          </>
        ) : null}
        <Box sx={{ flexGrow: 1 }} />
        <HsFooter version={EXTENSION_VERSION} />
      </Box>
    </ThemeProvider>
  )
}
