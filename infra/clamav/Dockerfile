# ClamAV sidecar for the API: the official image plus one setting. Built into the registry by .github/workflows/deploy.yml.
FROM docker.io/clamav/clamav:stable

# Report Office files that contain VBA macros, including old Word .doc files, as "Heuristics.OLE2.ContainsMacros FOUND".
# The API refuses any FOUND verdict, so macro documents never reach HR.
RUN printf '\n# Kiaratech: refuse Office documents that contain macros\nAlertOLE2Macros yes\n' >> /etc/clamav/clamd.conf
