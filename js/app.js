(() => {
  "use strict";

  const lessons = [
    {
      eyebrow:"STEP 01 · FOUNDATION", title:"AWS VPC and two EC2 instances",
      plain:"The VPC is your secured campus. EC2 A is the reception desk in the public area; EC2 B is a restricted room with no direct public entrance.",
      technical:"In us-east-1, place the bastion in a public subnet and the target in a private subnet. The bastion needs a route to the target, and EC2 B must accept SSH from the bastion security group.",
      watch:"Follow the highlighted network boundary and notice that the target server stays inside the private subnet.",
      command:"# No command needed for this overview", note:"No command needed for this overview.", explain:"Example region: us-east-1 (N. Virginia). This is an illustrative diagram, not a live AWS account.", scene:"network"
    },
    {
      eyebrow:"STEP 02 · SECURE SHELL", title:"Understanding SSH and port 22",
      plain:"SSH is like a secure tunnel between two rooms. A request knocks on the SSH entrance; only a route and valid access rules let it through.",
      technical:"SSH (Secure Shell) provides encrypted remote administration over TCP port 22 by default. EC2 A must have network reachability to EC2 B's private IP and security group rules must allow the flow.",
      watch:"Watch the envelope travel from the bastion toward the private server, along the SSH path.",
      command:"ssh -p 22 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>", note:"SSH command shape", explain:"Run this on EC2 A after network access and key authorization are configured. Replace the placeholder; port 22 is the default so -p 22 is optional.", scene:"ssh"
    },
    {
      eyebrow:"STEP 03 · IDENTITY", title:"Private key vs public key",
      plain:"The private key is your personal secret key. The public key is an identity proof you can register with the server. Think: keep the key safe, share only the lock's approved matching identity.",
      technical:"With public-key authentication, the client proves it controls the private key without sending that key to the server. The matching public key is stored in the target user's ~/.ssh/authorized_keys file.",
      watch:"Two distinct key cards appear. The private key stays with EC2 A; only the public key can be installed on EC2 B.",
      command:"# Never copy or publish ~/.ssh/id_ed25519\n# Share only ~/.ssh/id_ed25519.pub", note:"Safety reminder", explain:"A private key is a credential. Do not paste its contents into terminals, chat, screenshots, repositories, or the target instance.", scene:"keys"
    },
    {
      eyebrow:"STEP 04 · KEY CREATION", title:"Generate an SSH key pair",
      plain:"EC2 A creates a matching pair: one secret key kept on the source machine and one public key that can be registered with the target.",
      technical:"On Amazon Linux 2023, use ssh-keygen to create an Ed25519 key pair. This creates ~/.ssh/id_ed25519 and ~/.ssh/id_ed25519.pub. This is separate from an EC2 launch key pair you may already use to log in.",
      watch:"The private and public key objects appear as a pair. Only the public object follows the route to the target in a later step.",
      command:"ssh-keygen -t ed25519\n# Choose a safe file path and passphrase when prompted", note:"Generate a new key pair", explain:"Use this only if you intend to create a new key pair. If you already have an approved key, use that existing key instead; do not overwrite it accidentally.", scene:"generate"
    },
    {
      eyebrow:"STEP 05 · TERMINAL TOUR", title:"View SSH files safely",
      plain:"The .ssh folder is the key cabinet. You can list files and display the public key, but never print the private key's contents.",
      technical:"pwd prints the current directory; ls -la lists files including hidden ones; cd ~/.ssh enters the SSH directory; cat ~/.ssh/id_ed25519.pub displays the public key only.",
      watch:"The terminal card shows each command in order. The private-key contents are intentionally never displayed.",
      command:"pwd\nls -la\ncd ~/.ssh\nls -la\ncat ~/.ssh/id_ed25519.pub", note:"Run on EC2 A", explain:"The final command displays the public key line to register through an already-authorized administrative method. Never run cat ~/.ssh/id_ed25519 to reveal the private key.", scene:"terminal"
    },
    {
      eyebrow:"STEP 06 · AUTHORIZATION", title:"Authorize the public key",
      plain:"The public key is added to the approved visitor list on EC2 B. It is not enough to have a key: the target account must trust its matching public key.",
      technical:"Use a secure, already-authorized administrative method to append EC2 A's public key to the correct target user's ~/.ssh/authorized_keys. On Amazon Linux 2023, that user is commonly ec2-user. Ensure ownership and permissions are correct.",
      watch:"Only the public-key symbol travels to EC2 B, where the authorized_keys list lights up. The private key remains on EC2 A.",
      command:"mkdir -p ~/.ssh\nchmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys\nchown -R ec2-user:ec2-user ~/.ssh", note:"Run on EC2 B as the target user/admin", explain:"These example commands assume the target account is ec2-user and the shell has the required permissions. Ensure the home directory and .ssh files are owned by the target user. Append the public key; do not replace existing approved keys.", scene:"authorize"
    },
    {
      eyebrow:"STEP 07 · NETWORK GUARD", title:"Configure Security Groups",
      plain:"Security groups are stateful guards. EC2 B should let SSH in only from the bastion's security group—not from every address on the internet.",
      technical:"Set EC2 B's inbound rule to TCP 22 with the source set to EC2 A's security group where supported and appropriate. EC2 A also needs outbound reachability, and route tables/NACLs must permit the path.",
      watch:"Both guard icons appear. The private target's guard checks the source before the SSH session can enter.",
      command:"# EC2 B security group inbound rule:\n# Type: SSH | Protocol: TCP | Port: 22\n# Source: EC2 A security group (sg-...)", note:"AWS Console rule reference", explain:"Do not use 0.0.0.0/0 for the private target's SSH rule. If security-group referencing is not supported for your topology, use a narrowly scoped source CIDR and review routing.", scene:"security"
    },
    {
      eyebrow:"STEP 08 · AUTHENTICATE", title:"Connect from EC2 A to EC2 B",
      plain:"EC2 A knocks, EC2 B checks its guard rules, then verifies that the client holds the private key matching an approved public key. A secure session opens only when each check passes.",
      technical:"Run SSH from EC2 A using the private key stored on EC2 A. The source host must have a network route to EC2 B's private IP; EC2 B's security group must allow TCP 22 from EC2 A, and the username/key must match.",
      watch:"The request, key, and encrypted-session symbols move along the path. A green check means the simulated handshake succeeded.",
      command:"ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>", note:"Run on EC2 A", explain:"Replace <PRIVATE_IP_OF_INSTANCE_B> with the target's private IPv4 address. Keep the private key on EC2 A. If using an existing EC2 launch key pair, point -i to that authorized private key instead.", scene:"connect"
    },
    {
      eyebrow:"STEP 09 · VERIFY & REPAIR", title:"Verify the session and troubleshoot",
      plain:"Once connected, ask the server who you are, what its hostname is, and which IP addresses it has. If the connection fails, check one layer at a time.",
      technical:"Permission denied (publickey) usually points to username, key, authorized_keys, ownership, or permissions. Timeout often indicates routing or a security rule; refused often means the host is reachable but sshd is not listening or a host firewall rejects it.",
      watch:"A green check marks a successful login; a red cross represents a rejected connection. Use the troubleshooting checklist below the commands.",
      command:"whoami\nhostname\nhostname -I", note:"Run on EC2 B after login", explain:"These commands show the logged-in account, machine hostname, and assigned IP addresses. Do not treat hostname -I as proof that routing or security rules are correct.", scene:"verify"
    }
  ];

  const $ = (id) => document.getElementById(id);
  let current = 0;
  let autoplayTimer = null;
  let autoplay = false;
  let animationsPaused = false;
  let lightMode = false;

  const navButtons = [...document.querySelectorAll(".step-link")];
  const dotButtons = [...document.querySelectorAll(".dot")];
  const moving = ["moving-request", "moving-key", "moving-lock", "moving-check", "moving-cross"];
  const allSceneIds = ["vpc-zone","subnet-public","subnet-private","internet-gateway","instance-a","instance-b","security-a","security-b","terminal-panel","keypair-objects","auth-list","status-failure",...moving];

  function setOpacity(id, value) {
    const node = $(id);
    if (node) node.style.opacity = String(value);
  }
  function show(id, yes) {
    const node = $(id);
    if (node) node.style.opacity = yes ? "1" : "0";
  }
  function setScene(scene) {
    allSceneIds.forEach(id => {
      const el = $(id);
      if (el) el.classList.remove("highlight","dimmed");
    });
    moving.forEach(id => show(id, false));
    show("terminal-panel", false);
    show("keypair-objects", false);
    show("auth-list", false);
    show("status-failure", false);
    show("security-a", false);
    show("security-b", false);
    show("internet-gateway", true);
    show("instance-a", true);
    show("instance-b", true);
    show("vpc-zone", true);
    show("subnet-public", true);
    show("subnet-private", true);

    const setMoving = (...ids) => ids.forEach(id => show(id, true));
    switch(scene) {
      case "network":
        $("vpc-zone").classList.add("highlight");
        $("subnet-public").classList.add("highlight");
        $("subnet-private").classList.add("highlight");
        break;
      case "ssh":
        setMoving("moving-request","moving-lock");
        $("connection-paths").classList.add("highlight");
        break;
      case "keys":
        show("keypair-objects", true); setMoving("moving-key");
        $("instance-a").classList.add("highlight");
        break;
      case "generate":
        show("keypair-objects", true); setMoving("moving-key");
        $("terminal-panel").style.opacity = ".95";
        $("terminal-panel").querySelectorAll("text")[1].textContent = "$ ssh-keygen -t ed25519";
        $("terminal-panel").querySelectorAll("text")[2].textContent = "Generating public/private ed25519 key pair...";
        $("terminal-panel").querySelectorAll("text")[3].textContent = "Saved private + public key files on EC2 A";
        break;
      case "terminal":
        show("terminal-panel", true);
        $("terminal-panel").querySelectorAll("text")[1].textContent = "$ pwd  ·  ls -la  ·  cd ~/.ssh";
        $("terminal-panel").querySelectorAll("text")[2].textContent = "$ ls -la  ·  cat ~/.ssh/id_ed25519.pub";
        $("terminal-panel").querySelectorAll("text")[3].textContent = "Public key only — private key contents hidden";
        $("terminal-panel").classList.add("highlight");
        break;
      case "authorize":
        show("auth-list", true); setMoving("moving-key");
        $("instance-b").classList.add("highlight");
        break;
      case "security":
        show("security-a", true); show("security-b", true);
        $("security-a").classList.add("highlight"); $("security-b").classList.add("highlight");
        setMoving("moving-request");
        break;
      case "connect":
        show("security-a", true); show("security-b", true);
        show("terminal-panel", true);
        $("terminal-panel").querySelectorAll("text")[1].textContent = "$ ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP>";
        $("terminal-panel").querySelectorAll("text")[2].textContent = "SSH handshake · verifying public-key proof...";
        $("terminal-panel").querySelectorAll("text")[3].textContent = "Successfully connected to EC2 Instance B";
        setMoving("moving-request","moving-key","moving-lock","moving-check");
        $("instance-a").classList.add("highlight"); $("instance-b").classList.add("highlight");
        break;
      case "verify":
        show("terminal-panel", true);
        $("terminal-panel").querySelectorAll("text")[1].textContent = "$ whoami  ·  hostname  ·  hostname -I";
        $("terminal-panel").querySelectorAll("text")[2].textContent = "ec2-user  ·  ip-10-0-2-61  ·  10.0.2.61";
        $("terminal-panel").querySelectorAll("text")[3].textContent = "✓ Success       × Rejected: diagnose each layer";
        setMoving("moving-check","moving-cross");
        show("status-failure", true);
        break;
    }
    if (scene !== "generate" && scene !== "terminal" && scene !== "connect" && scene !== "verify") {
      const panel = $("terminal-panel");
      if (panel) {
        const texts = panel.querySelectorAll("text");
        if (texts.length >= 4) {
          texts[1].textContent = "$ ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP>";
          texts[2].textContent = "Authenticating with public key...";
          texts[3].textContent = "Successfully connected to EC2 Instance B";
        }
      }
    }
  }

  function render(index) {
    current = Math.max(0, Math.min(lessons.length - 1, index));
    const lesson = lessons[current];
    $("lesson-eyebrow").textContent = lesson.eyebrow;
    $("lesson-title").textContent = lesson.title;
    $("plain-text").textContent = lesson.plain;
    $("technical-text").textContent = lesson.technical;
    $("watch-text").textContent = lesson.watch;
    $("command-text").textContent = lesson.command;
    $("command-note").textContent = lesson.note;
    $("command-explain").textContent = lesson.explain;
    $("lesson-index").innerHTML = `${String(current+1).padStart(2,"0")}<span>/09</span>`;
    $("progress-text").textContent = `Step ${current+1} of 9`;
    $("progress-fill").style.width = `${((current+1)/9)*100}%`;
    $("progressbar").setAttribute("aria-valuenow", String(current+1));
    $("diagram-step-label").textContent = `${String(current+1).padStart(2,"0")} / 09 · ${lesson.eyebrow.split("·")[1].trim()}`;
    navButtons.forEach((button, i) => {
      button.classList.toggle("active", i === current);
      if (i === current) button.setAttribute("aria-current","step");
      else button.removeAttribute("aria-current");
    });
    dotButtons.forEach((button, i) => button.classList.toggle("active", i === current));
    $("prev-btn").disabled = current === 0;
    $("next-btn").disabled = current === lessons.length - 1;
    $("next-btn").textContent = current === lessons.length - 1 ? "Journey complete ✓" : "Next step →";
    $("copy-command").disabled = lesson.command.startsWith("# No command");
    setScene(lesson.scene);
    if (animationsPaused) pauseSvgMotion(true);
  }

  function pauseSvgMotion(paused) {
    const svg = $("network-svg");
    try {
      if (svg) {
        if (paused && typeof svg.pauseAnimations === "function") svg.pauseAnimations();
        else if (!paused && typeof svg.unpauseAnimations === "function") svg.unpauseAnimations();
      }
    } catch (_) {}
    $("motion-btn").innerHTML = paused ? '▶ <span class="sr-only">Resume animation</span>' : '⏸ <span class="sr-only">Pause animation</span>';
    $("motion-btn").setAttribute("aria-pressed", String(paused));
    animationsPaused = paused;
  }

  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = null;
    autoplay = false;
    $("autoplay-btn").setAttribute("aria-pressed","false");
    $("autoplay-state").textContent = "Off";
    $("autoplay-btn").querySelector("span").textContent = "▶";
  }
  function startAutoplay() {
    stopAutoplay();
    autoplay = true;
    $("autoplay-btn").setAttribute("aria-pressed","true");
    $("autoplay-state").textContent = "On";
    $("autoplay-btn").querySelector("span").textContent = "Ⅱ";
    autoplayTimer = window.setInterval(() => {
      if (current >= lessons.length - 1) render(0);
      else render(current + 1);
    }, 5000);
  }

  navButtons.forEach(button => button.addEventListener("click", () => { stopAutoplay(); render(Number(button.dataset.step)); }));
  dotButtons.forEach(button => button.addEventListener("click", () => { stopAutoplay(); render(Number(button.dataset.step)); }));
  $("prev-btn").addEventListener("click", () => { stopAutoplay(); render(current - 1); });
  $("next-btn").addEventListener("click", () => { stopAutoplay(); render(current + 1); });
  $("autoplay-btn").addEventListener("click", () => autoplay ? stopAutoplay() : startAutoplay());
  $("reset-btn").addEventListener("click", () => { stopAutoplay(); pauseSvgMotion(false); lightMode = false; document.body.classList.remove("theme-light"); $("theme-btn").textContent = "◐ Light mode"; $("theme-btn").setAttribute("aria-pressed","false"); render(0); });
  $("theme-btn").addEventListener("click", () => {
    lightMode = !lightMode;
    document.body.classList.toggle("theme-light", lightMode);
    $("theme-btn").textContent = lightMode ? "◑ Dark mode" : "◐ Light mode";
    $("theme-btn").setAttribute("aria-pressed", String(lightMode));
  });
  $("motion-btn").addEventListener("click", () => pauseSvgMotion(!animationsPaused));
  $("copy-command").addEventListener("click", async () => {
    const command = lessons[current].command;
    try {
      await navigator.clipboard.writeText(command);
      $("copy-command").textContent = "Copied ✓";
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = command; area.setAttribute("readonly",""); area.style.position="absolute"; area.style.left="-9999px";
      document.body.appendChild(area); area.select();
      const ok = document.execCommand("copy"); area.remove();
      $("copy-command").textContent = ok ? "Copied ✓" : "Select command";
    }
    window.setTimeout(() => $("copy-command").textContent = "Copy command", 1600);
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") { if (current < 8) render(current + 1); }
    if (event.key === "ArrowLeft") { if (current > 0) render(current - 1); }
  });

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    pauseSvgMotion(true);
    $("motion-btn").title = "Animations paused because reduced motion is enabled";
  }
  render(0);
})();
