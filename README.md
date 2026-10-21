# bastion-host — SSH Learning Lab

An interactive, animated educational project that teaches SSH key-based authentication from an AWS EC2 bastion host (jump server) to a private EC2 target. It is designed as a beginner-friendly visual lab with nine navigable lessons, animated SVG paths, command explanations, copy-command controls, auto-play, dark/light mode, keyboard navigation, and reduced-motion support.

**Brand:** #Buildwithvinit  
**Example AWS Region:** `us-east-1` — US East (N. Virginia)  
**Operating system:** Amazon Linux 2023  
**Default example username:** `ec2-user`

> This is a static educational simulation, not a live AWS deployment or an AWS configuration tool. Replace example values with your own environment only after verifying your permissions and network design.

## Story and architecture

- **EC2 A — Bastion Host / Jump Server:** A controlled entry point in a public subnet.
- **EC2 B — Private Target Server:** A server in a private subnet, without direct public SSH exposure.
- **SSH:** An encrypted administrative tunnel, normally using TCP port 22.
- **Private key:** A secret credential retained only on the authorized source machine.
- **Public key:** The matching identity proof installed on the target account.
- **`authorized_keys`:** The target user's approved public-key list.
- **Security group:** A stateful virtual network guard.
- **Port 22:** The default SSH entrance.
- **Public subnet:** The reception area, with a route that can support the bastion's intended access.
- **Private subnet:** The restricted server room, reachable through an intentionally configured network path.

The bastion needs authorized network access to the private target. For EC2 B, prefer an inbound SSH rule whose source is EC2 A's security group when security-group referencing is supported by the topology. Do not expose the private target's SSH port to the entire internet.

## The nine learning steps

1. **AWS VPC and two EC2 instances** — Understand the VPC boundary, public subnet, private subnet, and the two roles.
2. **Understanding SSH** — Learn Secure Shell and TCP port 22.
3. **Understanding SSH keys** — Compare the private secret key with the public identity proof.
4. **Generate SSH keys** — Use `ssh-keygen -t ed25519` and learn where the pair is saved.
5. **View SSH keys** — Inspect directories and display only the public key. The project never prints private-key contents.
6. **Authorize the public key** — Install the public key through an already-authorized administrative method and check ownership/permissions.
7. **Configure Security Groups** — Allow SSH from the bastion security group, not from the whole internet.
8. **Connect EC2 A to EC2 B** — Follow the simulated SSH handshake.
9. **Verify and troubleshoot** — Verify identity/host/IP and diagnose common failures.

## Run locally

No build step, package manager, or JavaScript dependency is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser. For best clipboard behavior, use localhost or HTTPS; browsers may restrict clipboard access on `file://` pages.
3. Navigate with the sidebar, Previous/Next buttons, or keyboard **← / →** arrow keys. Auto-play advances every five seconds.

Optional local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## SSH command reference

### Generate a new key pair on EC2 A

```bash
ssh-keygen -t ed25519
```

Choose a safe path and consider a passphrase. This generates a private key such as `~/.ssh/id_ed25519` and a public key at `~/.ssh/id_ed25519.pub`.

**Important distinction:** Generating a new key pair is not the same as using an existing EC2 launch key pair. If an existing authorized private key is already available on the approved source machine, use it rather than creating or overwriting keys unnecessarily.

### Inspect the SSH directory safely

```bash
pwd
ls -la
cd ~/.ssh
ls -la
cat ~/.ssh/id_ed25519.pub
```

The last command displays the **public** key only. Never display, paste, copy to another server, or publish the private key.

### Install the public key on EC2 B

Use a secure, already-authorized administrative access method to append the contents of `id_ed25519.pub` to the correct target user's `~/.ssh/authorized_keys`. Do not copy the private key. Preserve existing authorized keys.

Example permission checks/repairs on EC2 B, adapted for the actual target user and home directory:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh
```

The target account should own its home directory and `.ssh` files. These example commands assume `ec2-user`; use the actual account when different.

### Connect from EC2 A to EC2 B

```bash
ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>
```

Replace the placeholder with EC2 B's private IPv4 address. The private key remains on EC2 A. The bastion must have a working route to EC2 B, and EC2 B's security group must allow TCP port 22 from EC2 A's security group (where supported).

### Verify after login

```bash
whoami
hostname
hostname -I
```

## Troubleshooting

| Symptom | What to check |
|---|---|
| `Permission denied (publickey)` | Correct username, selected private key, matching public key in the target user's `authorized_keys`, and file ownership/permissions. |
| `Connection timed out` | Route tables, subnet network path, security groups, network ACLs, host firewall, and the target private IP. |
| `Connection refused` | The host may be reachable but SSH service (`sshd`) may not be listening, or a host firewall may reject the connection. Check the instance through an authorized console/management path. |
| Incorrect username | Amazon Linux 2023 commonly uses `ec2-user`; other AMIs can use a different default user. |
| Incorrect private-key permissions | On EC2 A, use `chmod 600 ~/.ssh/id_ed25519`; ensure the file belongs to the intended user. |
| Public key missing from `authorized_keys` | Confirm the exact public key was appended to the correct user's home directory, without line wrapping or truncation. |
| SSH works from some networks only | Confirm the source security group/CIDR and routing match the intended architecture. |

## Security recommendations

- Keep private keys secret and only on the authorized source machine. Never commit them to GitHub or include them in screenshots, issue reports, or this project.
- Share/install only the public key (`.pub` file) using an approved, secure administrative method.
- Prefer a bastion or AWS Systems Manager Session Manager for controlled administration; consider whether Session Manager can remove the need for inbound SSH.
- Do not expose the private target's SSH port to `0.0.0.0/0` or `::/0`.
- Scope security-group access to the bastion security group when supported and appropriate.
- Use strong key protection and a passphrase where practical. Rotate/revoke access when users or keys are no longer authorized.
- Use least privilege, MFA for AWS console access, audit logs, patching, and appropriate IAM roles.
- Avoid copying a private key between instances. If you use an existing EC2 launch key pair, keep its private key protected and use only on the approved source machine.
- Validate all commands against your environment before running them. The diagram and IPs are illustrative only.

## GitHub Pages deployment

1. Create a GitHub repository named `bastion-host` and upload the project files (`index.html`, `css/`, `js/`, `README.md`, `.nojekyll`, and `LICENSE`) to the repository root.
2. Open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
3. Wait for the Pages build to finish and open the published URL shown in the Pages settings.

## Accessibility and interaction

- Keyboard navigation: **← / →** changes lessons; Tab and Enter/Space operate controls.
- Semantic page landmarks, labelled controls, and live lesson announcements are included.
- Honors `prefers-reduced-motion`; use the animation control to pause/resume motion.
- Responsive layout supports desktop, tablet, and mobile widths.
- The Bricolage Grotesque typeface is loaded from Google Fonts; system fonts are used as fallbacks if it is unavailable.

## License

Released under the MIT License. See [`LICENSE`](LICENSE).
