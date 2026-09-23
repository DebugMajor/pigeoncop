#!/usr/bin/env bash
set -e
python phase2_install.py
rm phase2_install.py
rm -f install-phase2-video.sh
printf '\nPigeonCop Phase 2 video upload installed successfully.\n'
