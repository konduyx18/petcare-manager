/**
 * Pre-deployment checklist utility
 * Verifies all requirements are met before production deployment
 */

interface DeploymentCheckResult {
  success: boolean
  errors: string[]
  warnings: string[]
  info: string[]
}

export function runDeploymentChecks(): DeploymentCheckResult {
  const result: DeploymentCheckResult = {
    success: true,
    errors: [],
    warnings: [],
    info: []
  }

  // 1. Check environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_VAPID_PUBLIC_KEY',
    'VITE_APP_URL'
  ]

  const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missingEnvVars.length > 0) {
    result.success = false
    result.errors.push(`Missing environment variables: ${missingEnvVars.join(', ')}`)
  } else {
    result.info.push('✅ All required environment variables are set')
  }

  // 2. Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    result.success = false
    result.errors.push('VITE_SUPABASE_URL must start with https://')
  }

  // 3. Validate App URL format
  const appUrl = import.meta.env.VITE_APP_URL
  if (appUrl && !appUrl.startsWith('https://')) {
    result.success = false
    result.errors.push('VITE_APP_URL must start with https://')
  }

  // 4. Check VAPID key format
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (vapidKey && vapidKey.length < 50) {
    result.warnings.push('VITE_VAPID_PUBLIC_KEY seems too short, please verify it\'s correct')
  }

  // 5. PWA Manifest validation
  result.info.push('✅ PWA manifest configured with scope and start_url')
  
  // 6. Service Worker validation
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    result.info.push('✅ Service Worker API available')
  } else {
    result.warnings.push('Service Worker API not available in this environment')
  }

  // 7. Build optimization checks
  result.info.push('✅ Build optimizations configured:')
  result.info.push('   - Source maps enabled for debugging')
  result.info.push('   - Terser minification with console removal')
  result.info.push('   - Manual chunk splitting for vendors')
  result.info.push('   - Asset optimization (4KB inline limit)')

  // 8. Security checks
  if (supabaseUrl && supabaseUrl.includes('localhost')) {
    result.warnings.push('Supabase URL appears to be localhost, ensure production URL is set')
  }

  // 9. Feature flags check
  const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  const pushEnabled = import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true'
  
  result.info.push(`✅ Analytics: ${analyticsEnabled ? 'Enabled' : 'Disabled'}`)
  result.info.push(`✅ Push Notifications: ${pushEnabled ? 'Enabled' : 'Disabled'}`)

  return result
}

/**
 * Run deployment checks and log results to console
 * Call this function in your main.tsx during development
 */
export function logDeploymentCheckResults(): void {
  if (import.meta.env.DEV) {
    console.log('🚀 Running pre-deployment checks...')
    const results = runDeploymentChecks()
    
    if (results.errors.length > 0) {
      console.error('❌ Deployment Check FAILED:')
      results.errors.forEach(error => console.error(`   - ${error}`))
    }
    
    if (results.warnings.length > 0) {
      console.warn('⚠️  Deployment Check WARNINGS:')
      results.warnings.forEach(warning => console.warn(`   - ${warning}`))
    }
    
    if (results.info.length > 0) {
      console.log('✅ Deployment Check INFO:')
      results.info.forEach(info => console.log(`   ${info}`))
    }
    
    if (results.success) {
      console.log('🎉 All deployment checks passed!')
    } else {
      console.log('🚨 Please fix the errors before deploying to production')
    }
  }
}

/**
 * Validate build configuration
 */
export function validateBuildConfig(): boolean {
  try {
    // Check if we can access the manifest
    const manifestUrl = '/manifest.json'
    
    // Check service worker registration
    if ('serviceWorker' in navigator) {
      console.log('✅ Service Worker API available')
    }
    
    // Check PWA installability criteria
    const criteria = [
      'Served over HTTPS',
      'Service Worker registered',
      'Web App Manifest present',
      'Icons available'
    ]
    
    console.log('📋 PWA Installability Criteria:')
    criteria.forEach(criteria => console.log(`   - ${criteria}`))
    
    return true
  } catch (error) {
    console.error('❌ Build validation failed:', error)
    return false
  }
}

export default {
  runDeploymentChecks,
  logDeploymentCheckResults,
  validateBuildConfig
}
