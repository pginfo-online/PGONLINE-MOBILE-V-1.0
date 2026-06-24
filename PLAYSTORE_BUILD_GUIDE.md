# Play Store AAB Build Guide

This project is configured for manual native versioning. Expo/EAS will not auto-increment the Android `versionCode`.

## Current Production Version

- App version: `1.0.0`
- Android version code: `1`
- Android package: `com.pginfo.online`
- Production build type: Android App Bundle (`.aab`)

## One-Time Setup

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in:
   ```bash
   eas login
   ```

3. Confirm the app config:
   ```bash
   npx expo config
   ```

4. Configure Android credentials when EAS asks during the first production build. Let EAS manage the upload key unless you already have a Play Console key strategy.

## Build The First AAB

Run:

```bash
eas build --platform android --profile production
```

When the build finishes, EAS will provide a download link for the `.aab`. Upload that file to Play Console.

## Submit To Play Console

Recommended first release path:

1. Open Google Play Console.
2. Create the app using package name `com.pginfo.online`.
3. Complete app content, privacy policy, data safety, store listing, screenshots, and testing requirements.
4. Upload the `.aab` to Internal testing first.
5. Test the install from Play Store internal testing.
6. Promote to Closed testing, Open testing, or Production when ready.

You can also submit with EAS later:

```bash
eas submit --platform android --profile production
```

## Future Updates

For every Play Store update, manually edit `app.json` before building:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

Rules:

- Increase `android.versionCode` by at least `1` for every new Play Store upload.
- Update `expo.version` when the user-facing version changes.
- Keep `eas.json` `autoIncrement` set to `false`.
- Build again with:
  ```bash
  eas build --platform android --profile production
  ```
- Upload the new `.aab` to the matching Play Console release track.

## Important Notes

- Play Store rejects any AAB with a `versionCode` that was already uploaded.
- Keep package name `com.pginfo.online` unchanged after the first Play Store release.
- Keep the keystore/upload key safe. If EAS manages credentials, do not delete the project credentials from Expo.
- Use Internal testing before promoting every production update.
