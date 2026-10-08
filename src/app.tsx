import styles from "./styles/styles.module.css";

const { React, ReactDOM } = Spicetify;

function waitForElement<T extends Element = HTMLElement>(
	selector: string,
): Promise<T> {
	return new Promise((resolve) => {
		const existing = document.querySelector(selector);
		if (existing) return resolve(existing as T);

		const observer = new MutationObserver(() => {
			const el = document.querySelector(selector);
			if (el) {
				observer.disconnect();
				resolve(el as T);
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	});
}

function AppsIcon() {
	return Spicetify.React.createElement(
		"svg",
		{
			width: "30",
			height: "30",
			viewBox: "0 -960 960 960",
			fill: "rgb(179, 179, 179)",
		},
		Spicetify.React.createElement("path", {
			d: "M183.5-183.5Q160-207 160-240t23.5-56.5Q207-320 240-320t56.5 23.5Q320-273 320-240t-23.5 56.5Q273-160 240-160t-56.5-23.5Zm240 0Q400-207 400-240t23.5-56.5Q447-320 480-320t56.5 23.5Q560-273 560-240t-23.5 56.5Q513-160 480-160t-56.5-23.5Zm240 0Q640-207 640-240t23.5-56.5Q687-320 720-320t56.5 23.5Q800-273 800-240t-23.5 56.5Q753-160 720-160t-56.5-23.5Zm-480-240Q160-447 160-480t23.5-56.5Q207-560 240-560t56.5 23.5Q320-513 320-480t-23.5 56.5Q273-400 240-400t-56.5-23.5Zm240 0Q400-447 400-480t23.5-56.5Q447-560 480-560t56.5 23.5Q560-513 560-480t-23.5 56.5Q513-400 480-400t-56.5-23.5Zm240 0Q640-447 640-480t23.5-56.5Q687-560 720-560t56.5 23.5Q800-513 800-480t-23.5 56.5Q753-400 720-400t-56.5-23.5Zm-480-240Q160-687 160-720t23.5-56.5Q207-800 240-800t56.5 23.5Q320-753 320-720t-23.5 56.5Q273-640 240-640t-56.5-23.5Zm240 0Q400-687 400-720t23.5-56.5Q447-800 480-800t56.5 23.5Q560-753 560-720t-23.5 56.5Q513-640 480-640t-56.5-23.5Zm240 0Q640-687 640-720t23.5-56.5Q687-800 720-800t56.5 23.5Q800-753 800-720t-23.5 56.5Q753-640 720-640t-56.5-23.5Z",
		}),
	);
}

function SpicetifyAppsDropDown({
	host,
	extensionsWrapper,
	customAppsWrapper,
}: {
	host: HTMLElement;
	extensionsWrapper: HTMLElement;
	customAppsWrapper: HTMLElement;
}) {
	React.useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		const menu = host.querySelector(`.${styles.dropdownMenu}`) as HTMLElement;

		const handleMouseEnter = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			if (menu) menu.classList.add(styles.dropdownMenuVisible);
		};

		const handleMouseLeave = () => {
			timeoutId = setTimeout(() => {
				if (menu) menu.classList.remove(styles.dropdownMenuVisible);
			}, 100); // delay buffer
		};

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Element | null;
			if (target?.closest("button, a, [role='button']") && menu) {
				menu.classList.remove(styles.dropdownMenuVisible);
			}
		};

		host.addEventListener("mouseenter", handleMouseEnter);
		host.addEventListener("mouseleave", handleMouseLeave);
		host.addEventListener("click", handleClick);

		return () => {
			host.removeEventListener("mouseenter", handleMouseEnter);
			host.removeEventListener("mouseleave", handleMouseLeave);
			host.removeEventListener("click", handleClick);
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [host]);

	return React.createElement(
		"div",
		{
			className: styles.dropdownContainer,
		},
		// Dropdown Trigger Button
		React.createElement(
			"button",
			{ className: styles.dropdownTrigger },
			Spicetify.React.createElement(AppsIcon),
		),
		//Dropdown Panel
		React.createElement(
			"div",
			{
				className: styles.dropdownMenu,
				style: { display: "flex" },
			},
			// Category 1: Extensions
			React.createElement(
				"div",
				{ className: styles.CategorySection },
				React.createElement(
					"span",
					{ className: styles.categoryTitle },
					"Extensions",
				),
				React.createElement("div", {
					className: `${styles.buttonRow} ${styles.slot}`,
					ref: (node: HTMLDivElement | null) => {
						if (node && extensionsWrapper)
							relocateElement(extensionsWrapper, node);
					},
				}),
			),
			// Category 2: Custom Apps
			React.createElement(
				"div",
				{ className: styles.categorySection },
				React.createElement(
					"span",
					{ className: styles.categoryTitle },
					"Custom Apps",
				),
				React.createElement("div", {
					className: `${styles.buttonRow} ${styles.slot}`,
					ref: (node: HTMLDivElement | null) => {
						if (node && customAppsWrapper)
							relocateElement(customAppsWrapper, node);
					},
				}),
			),
		),
	);
}

function relocateElement(
	targetSelectorOrElement: string | HTMLElement,
	destinationContainer: HTMLElement,
): HTMLElement | null {
	const element =
		typeof targetSelectorOrElement === "string"
			? document.querySelector<HTMLElement>(targetSelectorOrElement)
			: targetSelectorOrElement;

	if (element && element.parentElement !== destinationContainer) {
		destinationContainer.appendChild(element);
	}

	return element;
}

function disableTooltips(container: HTMLElement) {
	if ((container as any)._tippy) {
		(container as any)._tippy.disable();
	}

	container
		.querySelectorAll<HTMLElement>("[aria-describedby], [data-tippy-root]")
		.forEach((child) => {
			if ((child as any)._tippy) {
				(child as any)._tippy.disable();
			}
		});
}

async function main() {
	while (
		!Spicetify?.ReactDOM ||
		!Spicetify?.React ||
		!Spicetify?.Platform?.History
	) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const destination = await waitForElement(
		".main-globalNav-historyButtonsWrapper",
	);

	await waitForElement(".spicetify-topbar-button");

	const appsWrapper = await waitForElement(
		'.custom-navlinks-scrollable_container div[role="presentation"]',
	);

	let host = document.querySelector("#spicetify-dropdown-host") as HTMLElement;

	if (!host) {
		host = document.createElement("div");
		host.id = "spicetify-dropdown-host";
		host.className = styles.dropdownHost;
		destination.appendChild(host);
	}

	const allExtensionsWrapper = document.createElement("div");
	allExtensionsWrapper.className = "extensions-wrapper";

	const tooltip = document.createElement("div");
	tooltip.className = styles.tooltip;
	tooltip.setAttribute("role", "tooltip");
	document.body.appendChild(tooltip);

	let tooltipTarget: HTMLElement | null = null;

	const hideTooltip = () => {
		tooltip.classList.remove(styles.tooltipVisible);
		tooltipTarget = null;
	};

	const showTooltip = (target: HTMLElement) => {
		const label = target.getAttribute("aria-label")?.trim();
		if (!label) return;

		tooltip.textContent = label;
		tooltipTarget = target;
		const bounds = target.getBoundingClientRect();
		tooltip.style.left = `${bounds.left + bounds.width / 2}px`;
		tooltip.style.top = `${bounds.bottom + 8}px`;
		tooltip.classList.add(styles.tooltipVisible);
	};

	const findTooltipTarget = (
		target: EventTarget | null,
	): HTMLElement | null => {
		if (!(target instanceof Element)) return null;
		const control = target.closest<HTMLElement>(
			"button[aria-label], a[aria-label], [role='button'][aria-label]",
		);
		return control && host.contains(control) ? control : null;
	};

	const handlePointerOver = (event: PointerEvent) => {
		const target = findTooltipTarget(event.target);
		if (target && target !== tooltipTarget) showTooltip(target);
	};

	const handlePointerOut = (event: PointerEvent) => {
		const target = findTooltipTarget(event.target);
		const relatedTarget = findTooltipTarget(event.relatedTarget);
		if (target && target !== relatedTarget) hideTooltip();
	};

	const handleFocusIn = (event: FocusEvent) => {
		const target = findTooltipTarget(event.target);
		if (target) showTooltip(target);
	};

	const handleFocusOut = (event: FocusEvent) => {
		const target = findTooltipTarget(event.target);
		const relatedTarget = findTooltipTarget(event.relatedTarget);
		if (target && target !== relatedTarget) hideTooltip();
	};

	host.addEventListener("pointerover", handlePointerOver);
	host.addEventListener("pointerout", handlePointerOut);
	host.addEventListener("focusin", handleFocusIn);
	host.addEventListener("focusout", handleFocusOut);

	// Initial mount of React structure into host
	ReactDOM.render(
		React.createElement(SpicetifyAppsDropDown, {
			host,
			extensionsWrapper: allExtensionsWrapper,
			customAppsWrapper: appsWrapper,
		}),
		host,
	);

	const syncLayout = () => {
		relocateElement(host, destination);

		relocateElement(
			'a[aria-label="Home"], button[aria-label="Home"]',
			destination,
		);

		const extSlot = host.querySelector(`.${styles.slot}`);
		if (extSlot) {
			document
				.querySelectorAll<HTMLElement>(".spicetify-topbar-button")
				.forEach((container) => {
					disableTooltips(container);
					container
						.querySelectorAll<HTMLElement>(
							"button[aria-label], a[aria-label], [role='button'][aria-label]",
						)
						.forEach((button) => {
							allExtensionsWrapper.appendChild(button);
						});
				});
			relocateElement(allExtensionsWrapper, extSlot as HTMLElement);
		}

		const appsSlot = host.querySelectorAll(`.${styles.slot}`)[1];
		if (appsSlot && appsWrapper) {
			relocateElement(appsWrapper, appsSlot as HTMLElement);
		}

		if (appsWrapper) {
			appsWrapper.className = "custom-apps-wrapper";
		}
	};

	syncLayout();

	Spicetify.Platform.History.listen(() => {
		requestAnimationFrame(syncLayout);
	});

	const observer = new MutationObserver(() => {
		syncLayout();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
}

export default main;
