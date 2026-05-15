// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IncomeAttestation
 * @notice On-chain attestation for gig worker credit scores.
 * Workers own their attestations and grant/revoke lender access.
 * Built for Base L2 (low gas, EVM compatible).
 */
contract IncomeAttestation {
    address public owner;
    uint256 public attestationCounter;

    struct Attestation {
        uint256 id;
        address worker;
        uint256 score;       // 300-850 scaled to 30000-85000 (2 decimals)
        uint256 monthlyAvgIncome;
        uint256 incomeVolatility; // scaled: 0-10000 (4 decimals)
        uint256 tenureMonths;
        uint256 platformDiversity;
        uint256 reliabilityScore; // 0-100
        uint256 timestamp;
        bool isActive;
    }

    struct LenderPermission {
        address lender;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isActive;
    }

    mapping(address => uint256[]) public workerAttestationIds;
    mapping(uint256 => Attestation) public attestations;
    mapping(address => mapping(address => LenderPermission)) public permissions;

    event AttestationCreated(
        uint256 indexed id,
        address indexed worker,
        uint256 score,
        uint256 timestamp
    );

    event AttestationRevoked(uint256 indexed id);
    event PermissionGranted(address indexed worker, address indexed lender, uint256 expiresAt);
    event PermissionRevoked(address indexed worker, address indexed lender);

    modifier onlyWorker() {
        require(workerAttestationIds[msg.sender].length > 0 || msg.sender == owner, "Not a registered worker");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Create a new score attestation
     * @param score Credit score (300-850, multiplied by 100)
     * @param monthlyAvgIncome Average monthly income in USD cents
     * @param incomeVolatility Income volatility (scaled 0-10000)
     * @param tenureMonths Months of platform history
     * @param platformDiversity Number of active platforms
     * @param reliabilityScore Reliability score (0-100)
     */
    function createAttestation(
        uint256 score,
        uint256 monthlyAvgIncome,
        uint256 incomeVolatility,
        uint256 tenureMonths,
        uint256 platformDiversity,
        uint256 reliabilityScore
    ) external {
        require(score >= 30000 && score <= 85000, "Score must be 300-850");
        require(tenureMonths > 0, "Tenure must be > 0");

        attestationCounter++;
        uint256 id = attestationCounter;

        attestations[id] = Attestation({
            id: id,
            worker: msg.sender,
            score: score,
            monthlyAvgIncome: monthlyAvgIncome,
            incomeVolatility: incomeVolatility,
            tenureMonths: tenureMonths,
            platformDiversity: platformDiversity,
            reliabilityScore: reliabilityScore,
            timestamp: block.timestamp,
            isActive: true
        });

        workerAttestationIds[msg.sender].push(id);

        emit AttestationCreated(id, msg.sender, score, block.timestamp);
    }

    /**
     * @notice Owner-only: create attestation on behalf of a worker
     * @param worker Address of the worker being attested
     * @param score Credit score (300-850, multiplied by 100)
     * @param monthlyAvgIncome Average monthly income in USD cents
     * @param incomeVolatility Income volatility (scaled 0-10000)
     * @param tenureMonths Months of platform history
     * @param platformDiversity Number of active platforms
     * @param reliabilityScore Reliability score (0-100)
     */
    function attestForWorker(
        address worker,
        uint256 score,
        uint256 monthlyAvgIncome,
        uint256 incomeVolatility,
        uint256 tenureMonths,
        uint256 platformDiversity,
        uint256 reliabilityScore
    ) external {
        require(msg.sender == owner, "Only owner");
        require(score >= 30000 && score <= 85000, "Score must be 300-850");
        require(tenureMonths > 0, "Tenure must be > 0");
        require(worker != address(0), "Invalid worker address");

        attestationCounter++;
        uint256 id = attestationCounter;

        attestations[id] = Attestation({
            id: id,
            worker: worker,
            score: score,
            monthlyAvgIncome: monthlyAvgIncome,
            incomeVolatility: incomeVolatility,
            tenureMonths: tenureMonths,
            platformDiversity: platformDiversity,
            reliabilityScore: reliabilityScore,
            timestamp: block.timestamp,
            isActive: true
        });

        workerAttestationIds[worker].push(id);

        emit AttestationCreated(id, worker, score, block.timestamp);
    }

    /**
     * @notice Revoke an attestation (worker only)
     */
    function revokeAttestation(uint256 attestationId) external {
        require(attestations[attestationId].worker == msg.sender, "Not your attestation");
        attestations[attestationId].isActive = false;
        emit AttestationRevoked(attestationId);
    }

    /**
     * @notice Grant a lender access to view your attestations
     * @param lender Address of the lender
     * @param durationSeconds Duration of access in seconds (default 30 days)
     */
    function grantLenderAccess(address lender, uint256 durationSeconds) external {
        require(lender != address(0), "Invalid lender address");
        require(lender != msg.sender, "Cannot grant access to yourself");

        permissions[msg.sender][lender] = LenderPermission({
            lender: lender,
            grantedAt: block.timestamp,
            expiresAt: block.timestamp + durationSeconds,
            isActive: true
        });

        emit PermissionGranted(msg.sender, lender, block.timestamp + durationSeconds);
    }

    /**
     * @notice Revoke a lender's access
     */
    function revokeLenderAccess(address lender) external {
        permissions[msg.sender][lender].isActive = false;
        emit PermissionRevoked(msg.sender, lender);
    }

    /**
     * @notice Get a worker's latest active attestation (callable by lenders with permission)
     */
    function getLatestAttestation(address worker) external view returns (Attestation memory) {
        uint256[] storage ids = workerAttestationIds[worker];
        require(ids.length > 0, "No attestations found");

        // Check permission if caller is not the worker
        if (msg.sender != worker) {
            LenderPermission storage perm = permissions[worker][msg.sender];
            require(perm.isActive, "No access permission");
            require(perm.expiresAt > block.timestamp, "Access expired");
        }

        for (uint256 i = ids.length; i > 0; i--) {
            if (attestations[ids[i - 1]].isActive) {
                return attestations[ids[i - 1]];
            }
        }

        revert("No active attestations");
    }

    /**
     * @notice Get all attestation IDs for a worker
     */
    function getWorkerAttestationIds(address worker) external view returns (uint256[] memory) {
        return workerAttestationIds[worker];
    }

    /**
     * @notice Check if a lender has active access to a worker's attestations
     */
    function hasAccess(address worker, address lender) external view returns (bool) {
        LenderPermission storage perm = permissions[worker][lender];
        return perm.isActive && perm.expiresAt > block.timestamp;
    }
}
