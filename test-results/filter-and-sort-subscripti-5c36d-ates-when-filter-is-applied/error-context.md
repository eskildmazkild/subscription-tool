# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog "Failed to compile" [ref=e4]:
    - generic [ref=e5]:
      - heading "Failed to compile" [level=4] [ref=e7]
      - generic [ref=e8]:
        - generic [ref=e10]: "./node_modules/clsx/dist/clsx.mjs Module build failed: Error: ENOENT: no such file or directory, open '/Users/eskildmadseskildsen/coding/subscription-tool/node_modules/clsx/dist/clsx.mjs'"
        - contentinfo [ref=e11]:
          - paragraph [ref=e12]: This error occurred during the build process and can only be dismissed by fixing the error.
```