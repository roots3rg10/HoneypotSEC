#!/bin/bash

# Añadir al .bashrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Recargar
source ~/.bashrc

echo "✅ PATH configurado correctamente!"
